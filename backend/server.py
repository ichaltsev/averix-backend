from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timedelta, timezone
import jwt
import hashlib
import secrets
# Removed passlib

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Security
security = HTTPBearer()
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Averix API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    first_name: str
    last_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True
    tft_balance: float = 0.0
    staked_amount: float = 0.0
    trading_level: str = "Bronze"
    total_trades: int = 0
    successful_trades: int = 0

class StakeRequest(BaseModel):
    amount: float
    duration_days: int  # 14, 30, 90, 180, 360

class Stake(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    amount: float
    duration_days: int
    start_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_date: datetime
    is_active: bool = True
    rewards_earned: float = 0.0

class Trade(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    symbol: str
    side: str  # "buy" or "sell"
    amount: float
    price: float
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    status: str = "open"  # "open", "closed", "cancelled"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    closed_at: Optional[datetime] = None
    pnl: float = 0.0

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

# Utility functions  
def hash_password(password: str) -> str:
    # Simple SHA-256 hashing with salt for demo
    salt = "averix_salt_2025"
    return hashlib.sha256((password + salt).encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Auth endpoints
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        tft_balance=1000.0  # Welcome bonus
    )
    
    user_dict = user.dict()
    user_dict["password"] = hashed_password
    
    await db.users.insert_one(user_dict)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email}
    )
    
    return TokenResponse(
        access_token=access_token,
        user=user.dict()
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    # Find user
    user_doc = await db.users.find_one({"email": user_data.email})
    if not user_doc or not verify_password(user_data.password, user_doc["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user = User(**user_doc)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email}
    )
    
    return TokenResponse(
        access_token=access_token,
        user=user.dict()
    )

# User endpoints
@api_router.get("/user/profile", response_model=User)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.get("/user/dashboard")
async def get_dashboard(current_user: User = Depends(get_current_user)):
    # Get user's stakes
    stakes = await db.stakes.find({"user_id": current_user.id, "is_active": True}).to_list(100)
    
    # Get recent trades
    trades = await db.trades.find({"user_id": current_user.id}).sort("created_at", -1).limit(10).to_list(10)
    
    # Calculate total staked and rewards
    total_staked = sum(stake["amount"] for stake in stakes)
    total_rewards = sum(stake["rewards_earned"] for stake in stakes)
    
    return {
        "user": current_user.dict(),
        "total_staked": total_staked,
        "total_rewards": total_rewards,
        "active_stakes": len(stakes),
        "recent_trades": trades
    }

# Staking endpoints
@api_router.post("/staking/stake")
async def create_stake(stake_request: StakeRequest, current_user: User = Depends(get_current_user)):
    # Validate duration
    valid_durations = [14, 30, 90, 180, 360]
    if stake_request.duration_days not in valid_durations:
        raise HTTPException(status_code=400, detail="Invalid staking duration")
    
    # Check balance
    if current_user.tft_balance < stake_request.amount:
        raise HTTPException(status_code=400, detail="Insufficient TFT balance")
    
    # Create stake
    end_date = datetime.now(timezone.utc) + timedelta(days=stake_request.duration_days)
    stake = Stake(
        user_id=current_user.id,
        amount=stake_request.amount,
        duration_days=stake_request.duration_days,
        end_date=end_date
    )
    
    # Update user balance
    new_balance = current_user.tft_balance - stake_request.amount
    new_staked = current_user.staked_amount + stake_request.amount
    
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"tft_balance": new_balance, "staked_amount": new_staked}}
    )
    
    await db.stakes.insert_one(stake.dict())
    
    return {"message": "Stake created successfully", "stake": stake.dict()}

@api_router.get("/staking/stakes")
async def get_user_stakes(current_user: User = Depends(get_current_user)):
    stakes = await db.stakes.find({"user_id": current_user.id}).to_list(100)
    return {"stakes": stakes}

# Trading endpoints
@api_router.get("/trading/instruments")
async def get_trading_instruments():
    return {
        "instruments": [
            {"symbol": "BTC/USDT", "price": 45000.00, "change": 2.5},
            {"symbol": "ETH/USDT", "price": 2800.00, "change": 1.8},
            {"symbol": "EUR/USD", "price": 1.1200, "change": -0.2},
            {"symbol": "XAU/USD", "price": 1950.00, "change": 0.8}
        ]
    }

@api_router.post("/trading/place-order")
async def place_order(trade: Trade, current_user: User = Depends(get_current_user)):
    # Risk validation (basic)
    if trade.amount > (current_user.tft_balance * 0.05):  # Max 5% of balance
        raise HTTPException(status_code=400, detail="Order exceeds 5% of balance limit")
    
    if not trade.stop_loss or not trade.take_profit:
        raise HTTPException(status_code=400, detail="Stop loss and take profit are mandatory")
    
    trade.user_id = current_user.id
    
    # Simulate order execution (mock)
    trade.status = "closed"
    trade.closed_at = datetime.now(timezone.utc)
    trade.pnl = trade.amount * 0.02  # Mock 2% profit
    
    await db.trades.insert_one(trade.dict())
    
    # Update user stats
    await db.users.update_one(
        {"id": current_user.id},
        {
            "$inc": {
                "total_trades": 1,
                "successful_trades": 1 if trade.pnl > 0 else 0,
                "tft_balance": trade.pnl
            }
        }
    )
    
    return {"message": "Order placed successfully", "trade": trade.dict()}

@api_router.get("/trading/history")
async def get_trading_history(current_user: User = Depends(get_current_user)):
    trades = await db.trades.find({"user_id": current_user.id}).sort("created_at", -1).to_list(50)
    return {"trades": trades}

# Public endpoints
@api_router.get("/public/stats")
async def get_public_stats():
    return {
        "total_traders": 1250,
        "total_volume": "$2.5M",
        "active_stakes": 890,
        "tft_price": "$0.45"
    }

@api_router.get("/")
async def root():
    return {"message": "Averix API is running", "version": "1.0.0"}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()