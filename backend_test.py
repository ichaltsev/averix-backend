#!/usr/bin/env python3
"""
Averix Crypto-Finance Platform Backend API Testing
Tests all backend endpoints for the Averix trading platform
"""

import requests
import sys
import json
from datetime import datetime
import time

class AverixAPITester:
    def __init__(self, base_url="https://averix-crypto-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                try:
                    error_detail = response.json()
                    details += f", Response: {error_detail}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test(name, success, details)
            
            if success:
                try:
                    return response.json()
                except:
                    return {"status": "success"}
            return None

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return None

    def test_public_endpoints(self):
        """Test public endpoints that don't require authentication"""
        print("\n🔍 Testing Public Endpoints...")
        
        # Test root endpoint
        self.run_test("API Root", "GET", "", 200)
        
        # Test public stats
        stats = self.run_test("Public Stats", "GET", "public/stats", 200)
        if stats:
            required_fields = ['total_traders', 'total_volume', 'active_stakes', 'tft_price']
            for field in required_fields:
                if field in stats:
                    self.log_test(f"Public Stats - {field} field", True)
                else:
                    self.log_test(f"Public Stats - {field} field", False, f"Missing field: {field}")

        # Test trading instruments
        instruments = self.run_test("Trading Instruments", "GET", "trading/instruments", 200)
        if instruments and 'instruments' in instruments:
            if len(instruments['instruments']) > 0:
                self.log_test("Trading Instruments - Has Data", True)
                # Check first instrument structure
                first_instrument = instruments['instruments'][0]
                required_fields = ['symbol', 'price', 'change']
                for field in required_fields:
                    if field in first_instrument:
                        self.log_test(f"Instrument - {field} field", True)
                    else:
                        self.log_test(f"Instrument - {field} field", False, f"Missing field: {field}")
            else:
                self.log_test("Trading Instruments - Has Data", False, "No instruments returned")

    def test_user_registration(self):
        """Test user registration with welcome bonus"""
        print("\n🔍 Testing User Registration...")
        
        # Generate unique test user
        timestamp = int(time.time())
        test_user = {
            "email": f"test_user_{timestamp}@averix.test",
            "password": "TestPass123!",
            "first_name": "Test",
            "last_name": "User"
        }
        
        response = self.run_test("User Registration", "POST", "auth/register", 200, test_user)
        
        if response:
            # Check response structure
            required_fields = ['access_token', 'token_type', 'user']
            for field in required_fields:
                if field in response:
                    self.log_test(f"Registration Response - {field}", True)
                else:
                    self.log_test(f"Registration Response - {field}", False, f"Missing field: {field}")
            
            # Check welcome bonus
            if 'user' in response and 'tft_balance' in response['user']:
                if response['user']['tft_balance'] == 1000.0:
                    self.log_test("Welcome Bonus - 1000 TFT", True)
                else:
                    self.log_test("Welcome Bonus - 1000 TFT", False, f"Got {response['user']['tft_balance']} TFT instead of 1000")
            
            # Store token and user data for subsequent tests
            if 'access_token' in response:
                self.token = response['access_token']
                self.user_data = response['user']
                self.test_user_credentials = test_user
                return True
        
        return False

    def test_user_login(self):
        """Test user login functionality"""
        print("\n🔍 Testing User Login...")
        
        if not hasattr(self, 'test_user_credentials'):
            self.log_test("User Login", False, "No test user credentials available")
            return False
        
        login_data = {
            "email": self.test_user_credentials["email"],
            "password": self.test_user_credentials["password"]
        }
        
        # Clear token to test login
        old_token = self.token
        self.token = None
        
        response = self.run_test("User Login", "POST", "auth/login", 200, login_data)
        
        if response:
            # Check response structure
            required_fields = ['access_token', 'token_type', 'user']
            for field in required_fields:
                if field in response:
                    self.log_test(f"Login Response - {field}", True)
                else:
                    self.log_test(f"Login Response - {field}", False, f"Missing field: {field}")
            
            # Restore token
            if 'access_token' in response:
                self.token = response['access_token']
                return True
        
        # Restore old token if login failed
        self.token = old_token
        return False

    def test_authenticated_endpoints(self):
        """Test endpoints that require authentication"""
        print("\n🔍 Testing Authenticated Endpoints...")
        
        if not self.token:
            self.log_test("Authenticated Tests", False, "No authentication token available")
            return
        
        # Test user profile
        profile = self.run_test("User Profile", "GET", "user/profile", 200)
        if profile:
            required_fields = ['id', 'email', 'first_name', 'last_name', 'tft_balance', 'trading_level']
            for field in required_fields:
                if field in profile:
                    self.log_test(f"Profile - {field} field", True)
                else:
                    self.log_test(f"Profile - {field} field", False, f"Missing field: {field}")

        # Test dashboard
        dashboard = self.run_test("User Dashboard", "GET", "user/dashboard", 200)
        if dashboard:
            required_fields = ['user', 'total_staked', 'total_rewards', 'active_stakes', 'recent_trades']
            for field in required_fields:
                if field in dashboard:
                    self.log_test(f"Dashboard - {field} field", True)
                else:
                    self.log_test(f"Dashboard - {field} field", False, f"Missing field: {field}")

        # Test staking endpoints
        stakes = self.run_test("User Stakes", "GET", "staking/stakes", 200)
        if stakes and 'stakes' in stakes:
            self.log_test("Staking - Get Stakes", True)

    def test_staking_system(self):
        """Test staking functionality"""
        print("\n🔍 Testing Staking System...")
        
        if not self.token:
            self.log_test("Staking Tests", False, "No authentication token available")
            return
        
        # Test staking with valid data
        stake_data = {
            "amount": 100.0,
            "duration_days": 30
        }
        
        stake_response = self.run_test("Create Stake", "POST", "staking/stake", 200, stake_data)
        if stake_response:
            if 'message' in stake_response and 'stake' in stake_response:
                self.log_test("Staking - Response Structure", True)
                
                # Check stake structure
                stake = stake_response['stake']
                required_fields = ['id', 'user_id', 'amount', 'duration_days', 'start_date', 'end_date']
                for field in required_fields:
                    if field in stake:
                        self.log_test(f"Stake - {field} field", True)
                    else:
                        self.log_test(f"Stake - {field} field", False, f"Missing field: {field}")
            else:
                self.log_test("Staking - Response Structure", False, "Missing message or stake in response")

        # Test staking with invalid duration
        invalid_stake = {
            "amount": 50.0,
            "duration_days": 7  # Invalid duration
        }
        self.run_test("Invalid Stake Duration", "POST", "staking/stake", 400, invalid_stake)

        # Test staking with insufficient balance
        excessive_stake = {
            "amount": 10000.0,  # More than initial 1000 TFT
            "duration_days": 30
        }
        self.run_test("Insufficient Balance Stake", "POST", "staking/stake", 400, excessive_stake)

    def test_trading_system(self):
        """Test trading functionality with mock execution"""
        print("\n🔍 Testing Trading System...")
        
        if not self.token:
            self.log_test("Trading Tests", False, "No authentication token available")
            return
        
        # Test valid trade
        trade_data = {
            "symbol": "BTC/USDT",
            "side": "buy",
            "amount": 10.0,
            "price": 45000.0,
            "stop_loss": 44000.0,
            "take_profit": 46000.0
        }
        
        trade_response = self.run_test("Place Valid Trade", "POST", "trading/place-order", 200, trade_data)
        if trade_response:
            if 'message' in trade_response and 'trade' in trade_response:
                self.log_test("Trading - Response Structure", True)
                
                # Check trade structure
                trade = trade_response['trade']
                required_fields = ['id', 'user_id', 'symbol', 'side', 'amount', 'price', 'status', 'pnl']
                for field in required_fields:
                    if field in trade:
                        self.log_test(f"Trade - {field} field", True)
                    else:
                        self.log_test(f"Trade - {field} field", False, f"Missing field: {field}")
                
                # Check mock profit (should be 2% of amount)
                expected_pnl = trade_data['amount'] * 0.02
                if abs(trade['pnl'] - expected_pnl) < 0.01:
                    self.log_test("Trading - Mock 2% Profit", True)
                else:
                    self.log_test("Trading - Mock 2% Profit", False, f"Expected {expected_pnl}, got {trade['pnl']}")

        # Test trade without stop loss
        invalid_trade = {
            "symbol": "BTC/USDT",
            "side": "buy",
            "amount": 10.0,
            "price": 45000.0,
            "take_profit": 46000.0
            # Missing stop_loss
        }
        self.run_test("Trade Without Stop Loss", "POST", "trading/place-order", 400, invalid_trade)

        # Test trade exceeding 5% balance limit
        excessive_trade = {
            "symbol": "BTC/USDT",
            "side": "buy",
            "amount": 100.0,  # More than 5% of 1000 TFT balance
            "price": 45000.0,
            "stop_loss": 44000.0,
            "take_profit": 46000.0
        }
        self.run_test("Excessive Trade Amount", "POST", "trading/place-order", 400, excessive_trade)

        # Test trading history
        history = self.run_test("Trading History", "GET", "trading/history", 200)
        if history and 'trades' in history:
            self.log_test("Trading - History Structure", True)

    def test_error_handling(self):
        """Test error handling and edge cases"""
        print("\n🔍 Testing Error Handling...")
        
        # Test duplicate registration
        if hasattr(self, 'test_user_credentials'):
            self.run_test("Duplicate Registration", "POST", "auth/register", 400, self.test_user_credentials)
        
        # Test invalid login
        invalid_login = {
            "email": "nonexistent@test.com",
            "password": "wrongpassword"
        }
        self.run_test("Invalid Login", "POST", "auth/login", 401, invalid_login)
        
        # Test unauthorized access (without token)
        old_token = self.token
        self.token = None
        self.run_test("Unauthorized Profile Access", "GET", "user/profile", 401)
        self.token = old_token

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Averix Backend API Tests...")
        print(f"Testing against: {self.base_url}")
        
        start_time = time.time()
        
        # Run test suites in order
        self.test_public_endpoints()
        
        if self.test_user_registration():
            self.test_user_login()
            self.test_authenticated_endpoints()
            self.test_staking_system()
            self.test_trading_system()
        
        self.test_error_handling()
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed / self.tests_run * 100):.1f}%")
        print(f"Duration: {duration:.2f} seconds")
        
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": self.tests_run - self.tests_passed,
            "success_rate": self.tests_passed / self.tests_run * 100,
            "duration": duration,
            "test_results": self.test_results
        }

def main():
    """Main test execution"""
    tester = AverixAPITester()
    results = tester.run_all_tests()
    
    # Return appropriate exit code
    if results["failed_tests"] == 0:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n⚠️  {results['failed_tests']} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())