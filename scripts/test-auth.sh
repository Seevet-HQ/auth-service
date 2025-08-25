#!/bin/bash

# Auth Service Test Suite
# This script tests all authentication scenarios and provides a comprehensive summary

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3000/graphql"
TEST_EMAIL="testuser$(date +%s)@example.com"
TEST_USERNAME="testuser$(date +%s)"
TEST_PASSWORD="password123"
TEST_FIRST_NAME="Test"
TEST_LAST_NAME="User"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print test results
print_result() {
    local test_name="$1"
    local status="$2"
    local message="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓ PASS${NC} - $test_name: $message"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAIL${NC} - $test_name: $message"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to make GraphQL requests
graphql_request() {
    local query="$1"
    local auth_header="$2"
    
    if [ -n "$auth_header" ]; then
        curl -s "$BASE_URL" \
            -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: $auth_header" \
            -d "$query"
    else
        curl -s "$BASE_URL" \
            -X POST \
            -H "Content-Type: application/json" \
            -d "$query"
    fi
}

# Function to check if service is running
check_service() {
    echo -e "${BLUE}🔍 Checking if auth service is running...${NC}"
    
    local response
    response=$(curl -s "$BASE_URL" -X POST -H "Content-Type: application/json" \
        -d '{"query":"{ __schema { types { name } } }"}' 2>/dev/null || echo "")
    
    if echo "$response" | grep -q "UserObject"; then
        print_result "Service Health Check" "PASS" "Auth service is running and responding"
        return 0
    else
        print_result "Service Health Check" "FAIL" "Auth service is not responding"
        return 1
    fi
}

# Function to test user registration
test_registration() {
    echo -e "${BLUE}📝 Testing user registration...${NC}"
    
    local query='{"query":"mutation { register(input: { email: \"'$TEST_EMAIL'\", username: \"'$TEST_USERNAME'\", password: \"'$TEST_PASSWORD'\", firstName: \"'$TEST_FIRST_NAME'\", lastName: \"'$TEST_LAST_NAME'\" }) { accessToken refreshToken user { id email username } } }"}'
    
    local response
    response=$(graphql_request "$query")
    
    if echo "$response" | grep -q "accessToken" && echo "$response" | grep -q "refreshToken"; then
        print_result "User Registration" "PASS" "User registered successfully with tokens"
        
        # Extract tokens for later tests
        export ACCESS_TOKEN=$(echo "$response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
        export REFRESH_TOKEN=$(echo "$response" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)
        export USER_ID=$(echo "$response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        
        echo -e "  ${YELLOW}Tokens extracted:${NC}"
        echo -e "  Access Token: ${ACCESS_TOKEN:0:50}..."
        echo -e "  Refresh Token: ${REFRESH_TOKEN:0:50}..."
        echo -e "  User ID: $USER_ID"
        return 0
    else
        print_result "User Registration" "FAIL" "Failed to register user"
        echo -e "  ${RED}Response: $response${NC}"
        return 1
    fi
}

# Function to test user login
test_login() {
    echo -e "${BLUE}🔑 Testing user login...${NC}"
    
    local query='{"query":"mutation { login(input: { email: \"'$TEST_EMAIL'\", password: \"'$TEST_PASSWORD'\" }) { accessToken refreshToken user { id email username } } }"}'
    
    local response
    response=$(graphql_request "$query")
    
    if echo "$response" | grep -q "accessToken" && echo "$response" | grep -q "refreshToken"; then
        print_result "User Login" "PASS" "User logged in successfully with new tokens"
        
        # Update tokens for later tests
        export ACCESS_TOKEN=$(echo "$response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
        export REFRESH_TOKEN=$(echo "$response" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)
        
        echo -e "  ${YELLOW}New tokens received:${NC}"
        echo -e "  Access Token: ${ACCESS_TOKEN:0:50}..."
        echo -e "  Refresh Token: ${REFRESH_TOKEN:0:50}..."
        return 0
    else
        print_result "User Login" "FAIL" "Failed to login user"
        echo -e "  ${RED}Response: $response${NC}"
        return 1
    fi
}

# Function to test profile access with valid token
test_profile_access() {
    echo -e "${BLUE}👤 Testing profile access with valid token...${NC}"
    
    local query='{"query":"query { profile { id email username firstName lastName role } }"}'
    
    local response
    response=$(graphql_request "$query" "Bearer $ACCESS_TOKEN")
    
    if echo "$response" | grep -q "email" && echo "$response" | grep -q "$TEST_EMAIL"; then
        print_result "Profile Access (Valid Token)" "PASS" "Successfully accessed profile with valid token"
        return 0
    else
        print_result "Profile Access (Valid Token)" "FAIL" "Failed to access profile with valid token"
        echo -e "  ${RED}Response: $response${NC}"
        return 1
    fi
}

# Function to test token refresh
test_token_refresh() {
    echo -e "${BLUE}🔄 Testing token refresh...${NC}"
    
    local query='{"query":"mutation { refreshTokens(input: { refreshToken: \"'$REFRESH_TOKEN'\" }) { accessToken refreshToken user { id email username } } }"}'
    
    local response
    response=$(graphql_request "$query")
    
    if echo "$response" | grep -q "accessToken" && echo "$response" | grep -q "refreshToken"; then
        print_result "Token Refresh" "PASS" "Successfully refreshed tokens"
        
        # Store old tokens for invalidation test
        export OLD_ACCESS_TOKEN="$ACCESS_TOKEN"
        export OLD_REFRESH_TOKEN="$REFRESH_TOKEN"
        
        # Update tokens
        export ACCESS_TOKEN=$(echo "$response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
        export REFRESH_TOKEN=$(echo "$response" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)
        
        echo -e "  ${YELLOW}New tokens after refresh:${NC}"
        echo -e "  Access Token: ${ACCESS_TOKEN:0:50}..."
        echo -e "  Refresh Token: ${REFRESH_TOKEN:0:50}..."
        return 0
    else
        print_result "Token Refresh" "FAIL" "Failed to refresh tokens"
        echo -e "  ${RED}Response: $response${NC}"
        return 1
    fi
}

# Function to test old refresh token invalidation
test_old_refresh_token_invalidation() {
    echo -e "${BLUE}🚫 Testing old refresh token invalidation...${NC}"
    
    local query='{"query":"mutation { refreshTokens(input: { refreshToken: \"'$OLD_REFRESH_TOKEN'\" }) { accessToken refreshToken user { id email username } } }"}'
    
    local response
    response=$(graphql_request "$query")
    
    if echo "$response" | grep -q "Refresh token has been superseded or is invalid"; then
        print_result "Old Refresh Token Invalidation" "PASS" "Old refresh token properly rejected"
        return 0
    else
        print_result "Old Refresh Token Invalidation" "FAIL" "Old refresh token still works (security issue!)"
        echo -e "  ${RED}Response: $response${NC}"
        return 1
    fi
}

# Function to test logout
test_logout() {
    echo -e "${BLUE}🚪 Testing user logout...${NC}"
    
    local query='{"query":"mutation { logout { message } }"}'
    
    local response
    response=$(graphql_request "$query" "Bearer $ACCESS_TOKEN")
    
    if echo "$response" | grep -q "Logged out successfully"; then
        print_result "User Logout" "PASS" "User logged out successfully"
        return 0
    else
        print_result "User Logout" "FAIL" "Failed to logout user"
        echo -e "  ${RED}Response: $response${NC}"
        return 1
    fi
}

# Function to test revoked access token
test_revoked_access_token() {
    echo -e "${BLUE}🔒 Testing revoked access token...${NC}"
    
    local query='{"query":"query { profile { id email username firstName lastName role } }"}'
    
    local response
    response=$(graphql_request "$query" "Bearer $ACCESS_TOKEN")
    
    if echo "$response" | grep -q "Token has been revoked"; then
        print_result "Revoked Access Token" "PASS" "Revoked access token properly rejected"
        return 0
    else
        print_result "Revoked Access Token" "FAIL" "Revoked access token still works (security issue!)"
        echo -e "  ${RED}Response: $response${NC}"
        return 1
    fi
}

# Function to test revoked refresh token
test_revoked_refresh_token() {
    echo -e "${BLUE}🔒 Testing revoked refresh token...${NC}"
    
    local query='{"query":"mutation { refreshTokens(input: { refreshToken: \"'$REFRESH_TOKEN'\" }) { accessToken refreshToken user { id email username } } }"}'
    
    local response
    response=$(graphql_request "$query")
    
    if echo "$response" | grep -q "Refresh token has been superseded or is invalid"; then
        print_result "Revoked Refresh Token" "PASS" "Revoked refresh token properly rejected"
        return 0
    else
        print_result "Revoked Refresh Token" "FAIL" "Revoked refresh token still works (security issue!)"
        echo -e "  ${RED}Response: $response${NC}"
        return 1
    fi
}

# Function to test invalid token format
test_invalid_token_format() {
    echo -e "${BLUE}🚫 Testing invalid token format...${NC}"
    
    local query='{"query":"query { profile { id email username firstName lastName role } }"}'
    
    local response
    response=$(graphql_request "$query" "Bearer invalid.token.here")
    
    if echo "$response" | grep -q "Invalid or expired token"; then
        print_result "Invalid Token Format" "PASS" "Invalid token format properly rejected"
        return 0
    else
        print_result "Invalid Token Format" "FAIL" "Invalid token format not properly handled"
        echo -e "  ${RED}Response: $response${NC}"
        return 1
    fi
}

# Function to test missing authorization header
test_missing_auth_header() {
    echo -e "${BLUE}🚫 Testing missing authorization header...${NC}"
    
    local query='{"query":"query { profile { id email username firstName lastName role } }"}'
    
    local response
    response=$(graphql_request "$query")
    
    if echo "$response" | grep -q "Authorization header not found"; then
        print_result "Missing Auth Header" "PASS" "Missing authorization header properly handled"
        return 0
    else
        print_result "Missing Auth Header" "FAIL" "Missing authorization header not properly handled"
        echo -e "  ${RED}Response: $response${NC}"
        return 1
    fi
}

# Function to test Redis token storage
test_redis_token_storage() {
    echo -e "${BLUE}🗄️ Testing Redis token storage...${NC}"
    
    # Check if Redis is running and accessible
    if ! docker ps | grep -q "redis"; then
        print_result "Redis Token Storage" "FAIL" "Redis container not running"
        return 1
    fi
    
    # Check if refresh token exists in Redis
    local refresh_token_exists
    refresh_token_exists=$(docker exec auth-service-redis-1 redis-cli get "refresh_token:$USER_ID" 2>/dev/null || echo "")
    
    if [ -n "$refresh_token_exists" ]; then
        print_result "Redis Token Storage" "PASS" "Refresh token properly stored in Redis"
        return 0
    else
        print_result "Redis Token Storage" "FAIL" "Refresh token not found in Redis"
        return 1
    fi
}

# Function to test Redis token cleanup
test_redis_token_cleanup() {
    echo -e "${BLUE}🧹 Testing Redis token cleanup...${NC}"
    
    # Check if old refresh token was removed
    local old_refresh_token_exists
    old_refresh_token_exists=$(docker exec auth-service-redis-1 redis-cli get "refresh_token:$USER_ID" 2>/dev/null || echo "")
    
    if [ -z "$old_refresh_token_exists" ]; then
        print_result "Redis Token Cleanup" "PASS" "Old refresh token properly removed from Redis"
        return 0
    else
        print_result "Redis Token Cleanup" "FAIL" "Old refresh token still exists in Redis"
        return 1
    fi
}

# Function to test access token blacklisting
test_access_token_blacklisting() {
    echo -e "${BLUE}🚫 Testing access token blacklisting...${NC}"
    
    # Check if access token is blacklisted in Redis
    local crypto_hash
    crypto_hash=$(echo -n "$ACCESS_TOKEN" | sha256sum | cut -d' ' -f1)
    local blacklist_key="blacklisted_access_token:$crypto_hash"
    
    local is_blacklisted
    is_blacklisted=$(docker exec auth-service-redis-1 redis-cli exists "$blacklist_key" 2>/dev/null || echo "0")
    
    if [ "$is_blacklisted" = "1" ]; then
        print_result "Access Token Blacklisting" "PASS" "Access token properly blacklisted in Redis"
        return 0
    else
        print_result "Access Token Blacklisting" "FAIL" "Access token not found in blacklist"
        return 1
    fi
}

# Function to print test summary
print_summary() {
    echo -e "\n${BLUE}📊 TEST SUMMARY${NC}"
    echo -e "=================="
    echo -e "Total Tests: $TOTAL_TESTS"
    echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}🎉 ALL TESTS PASSED! 🎉${NC}"
        echo -e "The authentication system is working perfectly!"
        return 0
    else
        echo -e "\n${RED}❌ SOME TESTS FAILED! ❌${NC}"
        echo -e "Please review the failed tests above."
        return 1
    fi
}

# Main test execution
main() {
    echo -e "${BLUE}🚀 Starting Auth Service Test Suite${NC}"
    echo -e "=====================================\n"
    
    # Check if service is running
    if ! check_service; then
        echo -e "${RED}❌ Service is not running. Please start the auth service first.${NC}"
        exit 1
    fi
    
    echo -e "\n${BLUE}🧪 Running Authentication Tests${NC}"
    echo -e "================================\n"
    
    # Run all tests
    test_registration
    test_login
    test_profile_access
    test_token_refresh
    test_old_refresh_token_invalidation
    
    echo -e "\n${BLUE}🗄️ Running Redis Storage Tests${NC}"
    echo -e "==============================\n"
    
    test_redis_token_storage
    
    echo -e "\n${BLUE}🚪 Running Logout and Cleanup Tests${NC}"
    echo -e "========================================\n"
    
    test_logout
    test_revoked_access_token
    test_revoked_refresh_token
    test_redis_token_cleanup
    test_access_token_blacklisting
    test_invalid_token_format
    test_missing_auth_header
    
    # Print summary
    print_summary
    
    # Exit with appropriate code
    if [ $FAILED_TESTS -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main "$@"
