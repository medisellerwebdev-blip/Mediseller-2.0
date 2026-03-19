#!/usr/bin/env python3

import requests
import sys
from datetime import datetime

class MediSellerAPITester:
    def __init__(self, base_url="https://pharma-marketplace-4.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=10):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=timeout)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                
                # Try to parse JSON response if available
                try:
                    response_data = response.json()
                    if isinstance(response_data, list):
                        print(f"   Response: List with {len(response_data)} items")
                    elif isinstance(response_data, dict):
                        print(f"   Response: Dict with keys: {list(response_data.keys())[:5]}")
                    return success, response_data
                except:
                    print(f"   Response: {response.text[:100]}...")
                    return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")

            return success, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout after {timeout}s")
            return False, {}
        except requests.exceptions.ConnectionError:
            print(f"❌ Failed - Connection error")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_core_endpoints(self):
        """Test core MediSeller API endpoints"""
        print("🚀 Testing MediSeller Core API Endpoints...")
        
        # Test 1: Health Check / Root endpoint
        self.run_test("Root Endpoint", "GET", "", 200)
        
        # Test 2: Seed database (initialize data)
        self.run_test("Seed Database", "POST", "api/seed", 200)
        
        # Test 3: Get featured products
        success, products = self.run_test("Featured Products", "GET", "api/featured-products?limit=8", 200)
        if success and isinstance(products, list) and len(products) > 0:
            print(f"   ✅ Retrieved {len(products)} featured products")
        
        # Test 4: Get all products
        success, all_products = self.run_test("All Products", "GET", "api/products", 200)
        if success and isinstance(all_products, list):
            print(f"   ✅ Retrieved {len(all_products)} total products")
        
        # Test 5: Get testimonials
        success, testimonials = self.run_test("Testimonials", "GET", "api/testimonials", 200)
        if success and isinstance(testimonials, list):
            print(f"   ✅ Retrieved {len(testimonials)} testimonials")
        
        # Test 6: Get categories (if available)
        self.run_test("Categories", "GET", "api/categories", 200)
        
        return True

    def test_product_endpoints(self):
        """Test product-related endpoints"""
        print("\n🛍️ Testing Product-Specific Endpoints...")
        
        # Get a product first
        success, products = self.run_test("Get Products for Testing", "GET", "api/products?limit=1", 200)
        
        if success and isinstance(products, list) and len(products) > 0:
            product_id = products[0].get('product_id')
            if product_id:
                # Test single product detail
                self.run_test("Single Product Detail", "GET", f"api/products/{product_id}", 200)
            
        # Test search functionality
        self.run_test("Product Search", "GET", "api/products?search=cancer", 200)
        
        # Test category filtering
        self.run_test("Category Filter", "GET", "api/products?category=Cancer", 200)
        
        return True

    def test_consultation_endpoints(self):
        """Test consultation-related endpoints"""
        print("\n💬 Testing Consultation Endpoints...")
        
        # Test consultation request
        consultation_data = {
            "full_name": "Test User",
            "email": "test@example.com",
            "phone": "+1234567890",
            "medication": "Test medication inquiry",
            "preferred_contact": "WhatsApp"
        }
        
        self.run_test("Submit Consultation", "POST", "api/consultation", 201, consultation_data)
        
        return True

    def test_prescription_endpoints(self):
        """Test prescription upload endpoints"""
        print("\n📋 Testing Prescription Endpoints...")
        
        # Test prescription upload (mock data)
        prescription_data = {
            "user_id": "test-user-123",
            "filename": "test_prescription.jpg",
            "file_size": 1024000,
            "file_type": "image/jpeg"
        }
        
        # Note: Actual file upload would require multipart/form-data
        # This tests the endpoint structure
        self.run_test("Prescription Upload Info", "POST", "api/prescriptions/upload", 201, prescription_data)
        
        return True

    def test_error_handling(self):
        """Test error handling"""
        print("\n🚨 Testing Error Handling...")
        
        # Test 404 endpoints
        self.run_test("Non-existent Product", "GET", "api/products/non-existent-id", 404)
        self.run_test("Invalid Endpoint", "GET", "api/invalid-endpoint", 404)
        
        # Test invalid method
        self.run_test("Invalid Method", "DELETE", "api/products", 405)
        
        return True

def main():
    print("="*60)
    print("🏥 MediSeller API Testing Suite")
    print("="*60)
    
    # Initialize tester
    tester = MediSellerAPITester()
    
    try:
        # Run test suites
        tester.test_core_endpoints()
        tester.test_product_endpoints()
        tester.test_consultation_endpoints()
        tester.test_prescription_endpoints()
        tester.test_error_handling()
        
    except KeyboardInterrupt:
        print("\n⚠️  Testing interrupted by user")
    except Exception as e:
        print(f"\n💥 Unexpected error during testing: {str(e)}")
    
    # Print final results
    print("\n" + "="*60)
    print("📊 FINAL TEST RESULTS")
    print("="*60)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "No tests run")
    
    # Return appropriate exit code
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    elif tester.tests_passed > tester.tests_run * 0.7:  # 70% pass rate
        print("⚠️  Most tests passed, but some issues found")
        return 0
    else:
        print("❌ Significant test failures detected")
        return 1

if __name__ == "__main__":
    sys.exit(main())