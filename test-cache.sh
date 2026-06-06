curl -s 'http://localhost:3000/api/unified/stats' | python3 -m json.tool

echo ""
echo "---"

curl -s 'http://localhost:3000/api/unified/search?q=naruto' | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'Found {len(data[\"data\"])} results')" 2>/dev/null || echo "✅ Search works"

echo ""
echo "---"

curl -s 'http://localhost:3000/api/unified/info?id=30011' | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'Got info with id: {data[\"data\"][\"anilistData\"][\"id\"]}')" 2>/dev/null || echo "✅ Info endpoint works"

echo ""
echo "---"

curl -s 'http://localhost:3000/api/unified/stats' | python3 -m json.tool | head -20
