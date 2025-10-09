// Test script to verify Supabase storage setup
// Run this in browser console on your app page

async function testStorageSetup() {
  console.log('Testing Supabase Storage Setup...');
  
  try {
    // Import supabase (assuming it's available globally)
    const { supabase } = window;
    
    if (!supabase) {
      console.error('Supabase client not found');
      return;
    }
    
    // Test 1: List buckets
    console.log('1. Testing bucket access...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Buckets error:', bucketsError);
    } else {
      console.log('Available buckets:', buckets);
      
      const idDocsBucket = buckets.find(b => b.id === 'id-documents');
      const photosBucket = buckets.find(b => b.id === 'live-photos');
      
      console.log('ID Documents bucket:', idDocsBucket ? '✅ Found' : '❌ Missing');
      console.log('Live Photos bucket:', photosBucket ? '✅ Found' : '❌ Missing');
    }
    
    // Test 2: Create a test file
    console.log('2. Testing file upload...');
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('id-documents')
      .upload(`test-${Date.now()}.txt`, testFile);
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
    } else {
      console.log('Upload success:', uploadData);
      
      // Test 3: Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('id-documents')
        .getPublicUrl(uploadData.path);
      
      console.log('Public URL:', publicUrl);
      
      // Test 4: Delete test file
      const { error: deleteError } = await supabase.storage
        .from('id-documents')
        .remove([uploadData.path]);
      
      if (deleteError) {
        console.error('Delete error:', deleteError);
      } else {
        console.log('Test file deleted successfully');
      }
    }
    
    console.log('Storage test completed!');
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run the test
testStorageSetup();