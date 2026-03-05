#!/bin/bash
# CineBook Backend API Test Script
BASE="http://localhost:5000"

echo "============================================="
echo " CineBook Backend API Verification"
echo "============================================="

echo ""
echo "--- 1. Health Check ---"
curl -s $BASE/api/health

echo ""
echo "--- 2. Cities ---"
curl -s $BASE/api/cities

echo ""
echo "--- 3. All Movies ---"
curl -s $BASE/api/movies

echo ""
echo "--- 4. Trending ---"
curl -s $BASE/api/movies/trending

echo ""
echo "--- 5. All Events ---"
curl -s $BASE/api/events

echo ""
echo "--- 6. Register New User ---"
curl -s -X POST $BASE/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Verify Test","email":"verify@cinebook.com","password":"pass1234"}'

echo ""
echo "--- 7. Login and get token ---"
LOGIN=$(curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"verify@cinebook.com","password":"pass1234"}')
echo $LOGIN
TOKEN=$(echo $LOGIN | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

echo ""
echo "--- 8. Access bookings (No Token) - Expect 401 ---"
curl -s $BASE/api/bookings

echo ""
echo "--- 9. My Bookings (With Token) - Expect [] ---"
curl -s $BASE/api/bookings -H "Authorization: Bearer $TOKEN"

echo ""
echo "--- 10. Access admin with user token - Expect 403 ---"
curl -s $BASE/api/admin/movies -H "Authorization: Bearer $TOKEN"

echo ""
echo "--- 11. Promoting user to admin and retesting ... ---"
USER_ID=$(echo $LOGIN | python3 -c "import sys,json; print(json.load(sys.stdin)['user']['user_id'])")
mysql -u root cinebook -e "UPDATE users SET role='admin' WHERE user_id=$USER_ID;" 2>/dev/null

# Re-login to get a fresh token with admin role baked in
ADMIN_LOGIN=$(curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"verify@cinebook.com","password":"pass1234"}')
ADMIN_TOKEN=$(echo $ADMIN_LOGIN | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

echo ""
echo "--- 12. Admin Movies (as Admin) ---"
curl -s $BASE/api/admin/movies -H "Authorization: Bearer $ADMIN_TOKEN"

echo ""
echo "--- 13. Admin Events (as Admin) ---"
curl -s $BASE/api/admin/events -H "Authorization: Bearer $ADMIN_TOKEN"

echo ""
echo "--- 14. Admin Theatres (as Admin) ---"
curl -s $BASE/api/admin/theatres -H "Authorization: Bearer $ADMIN_TOKEN"

echo ""
echo "--- 15. Admin Reports Stats (as Admin) ---"
curl -s $BASE/api/admin/reports/stats -H "Authorization: Bearer $ADMIN_TOKEN"

echo ""
echo "--- Cleanup: reverting test user role ---"
mysql -u root cinebook -e "UPDATE users SET role='user' WHERE user_id=$USER_ID;" 2>/dev/null

echo ""
echo "============================================="
echo " All Tests Complete!"
echo "============================================="
