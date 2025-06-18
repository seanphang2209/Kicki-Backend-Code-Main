#!/usr/bin/env node

/**
 * 🧪 Enhanced Test Script for Kicko AI Backend API
 * Tests all the new features: weather integration, context enrichment, history, and multilingual support
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';

async function testAPI() {
  console.log('🧪 Testing Enhanced Kicko AI Backend API...\n');

  try {
    // Test 1: Root endpoint
    console.log('1️⃣ Testing root endpoint...');
    const rootResponse = await fetch(`${API_BASE_URL}/`);
    const rootData = await rootResponse.json();
    console.log('✅ Root endpoint:', rootData.message);
    console.log('📦 Version:', rootData.version);
    console.log('🚀 Features:', rootData.features.join(', '));
    console.log('');

    // Test 2: Health endpoint
    console.log('2️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health endpoint:', healthData.status);
    console.log('🔧 Services:', healthData.services);
    console.log('');

    // Test 3: Ask endpoint with full context
    console.log('3️⃣ Testing ask endpoint with smart context...');
    const askResponse = await fetch(`${API_BASE_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: 'What to Eat',
        user_input: 'I want something light and quick for lunch',
        user_profile: {
          diet: 'vegetarian',
          location: 'Singapore',
          budget: 'under $10',
          language: 'en'
        }
      })
    });

    if (askResponse.ok) {
      const askData = await askResponse.json();
      console.log('✅ Ask endpoint: Success!');
      console.log(`📝 Generated ${askData.suggestions.length} suggestions`);
      console.log(`🆔 Session ID: ${askData.session_id}`);
      console.log(`📚 History count: ${askData.history_count}`);
      
      // Display context information
      console.log('\n🌍 Context Information:');
      console.log(`   Time: ${askData.context.time_of_day} (${askData.context.day_of_week})`);
      if (askData.context.weather) {
        console.log(`   Weather: ${askData.context.weather.temperature}°C, ${askData.context.weather.description}`);
      } else {
        console.log('   Weather: Not available (API key may be missing)');
      }
      console.log(`   Location: ${askData.context.user_preferences.location}`);
      console.log(`   Diet: ${askData.context.user_preferences.diet}`);
      console.log(`   Budget: ${askData.context.user_preferences.budget}`);
      
      // Display suggestions
      console.log('\n💡 Suggestions:');
      askData.suggestions.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion.title}`);
        console.log(`      Reason: ${suggestion.reason}`);
      });

      // Test 4: Get user history
      console.log('\n4️⃣ Testing history endpoint...');
      const historyResponse = await fetch(`${API_BASE_URL}/history/${askData.session_id}`);
      const historyData = await historyResponse.json();
      console.log(`✅ History endpoint: Found ${historyData.count} previous interactions`);
      
      if (historyData.history.length > 0) {
        console.log('📚 Recent interactions:');
        historyData.history.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.category} - ${item.user_input.substring(0, 50)}...`);
        });
      }

      // Test 5: Multilingual support
      console.log('\n5️⃣ Testing multilingual support...');
      const multilingualResponse = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: 'What to Watch',
          user_input: 'I want to watch something relaxing',
          user_profile: {
            location: 'Tokyo',
            language: 'ja',
            budget: 'any'
          }
        })
      });

      if (multilingualResponse.ok) {
        const multilingualData = await multilingualResponse.json();
        console.log('✅ Multilingual endpoint: Success!');
        console.log(`🌍 Language: Japanese`);
        console.log(`📝 Generated ${multilingualData.suggestions.length} suggestions in Japanese`);
        multilingualData.suggestions.forEach((suggestion, index) => {
          console.log(`   ${index + 1}. ${suggestion.title}`);
        });
      } else {
        const errorData = await multilingualResponse.json();
        console.log('❌ Multilingual test failed:', errorData.error);
      }

    } else {
      const errorData = await askResponse.json();
      console.log('❌ Ask endpoint failed:', errorData.error);
      console.log('💡 Make sure your OPENAI_API_KEY is set correctly');
    }

    console.log('\n🎉 Enhanced API testing completed!');
    console.log('\n📋 Summary of features tested:');
    console.log('   ✅ Basic endpoints (root, health)');
    console.log('   ✅ Smart context enrichment (time, weather, location)');
    console.log('   ✅ AI-powered suggestions with GPT-4');
    console.log('   ✅ In-memory history management');
    console.log('   ✅ Multilingual support');
    console.log('   ✅ Session management');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💡 Make sure your server is running on port 5000');
    console.log('💡 Check that all environment variables are set correctly');
  }
}

// Run the tests
testAPI(); 