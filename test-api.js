#!/usr/bin/env node

/**
 * Simple test script for the Kicko AI Backend API
 * Run this after starting your server to verify everything works
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';

async function testAPI() {
  console.log('🧪 Testing Kicko AI Backend API...\n');

  try {
    // Test 1: Root endpoint
    console.log('1️⃣ Testing root endpoint...');
    const rootResponse = await fetch(`${API_BASE_URL}/`);
    const rootData = await rootResponse.json();
    console.log('✅ Root endpoint:', rootData.message);
    console.log('');

    // Test 2: Health endpoint
    console.log('2️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health endpoint:', healthData.status);
    console.log('');

    // Test 3: Ask endpoint
    console.log('3️⃣ Testing ask endpoint...');
    const askResponse = await fetch(`${API_BASE_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: 'restaurant',
        user_input: 'I want to try something new for dinner',
        user_profile: {
          diet: 'vegetarian',
          location: 'San Francisco',
          budget: 'medium'
        }
      })
    });

    if (askResponse.ok) {
      const askData = await askResponse.json();
      console.log('✅ Ask endpoint: Success!');
      console.log(`📝 Generated ${askData.suggestions.length} suggestions:`);
      askData.suggestions.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion.title}`);
        console.log(`      Reason: ${suggestion.reason}`);
      });
    } else {
      const errorData = await askResponse.json();
      console.log('❌ Ask endpoint failed:', errorData.error);
      console.log('💡 Make sure your OPENAI_API_KEY is set correctly');
    }

    console.log('\n🎉 API testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💡 Make sure your server is running on port 5000');
  }
}

// Run the tests
testAPI(); 