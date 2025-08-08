// Use API calls instead of direct database access to avoid environment variable issues
async function createRulesheets() {
  try {
    console.log('🔍 Looking for "Demo Corticon Project"...');
    
    // Get all projects using the API
    const projectsResponse = await fetch('http://127.0.0.1:5000/api/projects');
    if (!projectsResponse.ok) {
      throw new Error(`Failed to fetch projects: ${projectsResponse.status}`);
    }
    const projects = await projectsResponse.json();
    console.log('📋 Found projects:', projects.map(p => ({ id: p.id, name: p.name })));
    
    // Find the Demo Corticon Project
    const demoProject = projects.find(p => p.name === 'Demo Corticon Project');
    
    if (!demoProject) {
      console.log('❌ "Demo Corticon Project" not found!');
      console.log('Available projects:', projects.map(p => p.name));
      return;
    }
    
    console.log(`✅ Found "Demo Corticon Project" with ID: ${demoProject.id}`);
    
    // Create 10 empty rulesheets using the API
    console.log('📝 Creating 10 empty rulesheets...');
    
    for (let i = 1; i <= 10; i++) {
      const rulesheetName = `testRs${i}`;
      console.log(`Creating ${rulesheetName}...`);
      
      const createResponse = await fetch(`http://127.0.0.1:5000/api/projects/${demoProject.id}/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: rulesheetName,
          type: 'rulesheets',
          content: {
            // Empty rulesheet structure
            conditions: [],
            actions: [],
            rules: [],
            columns: []
          },
          structuralData: {
            // Empty structural data for rulesheets
            rows: [],
            columns: []
          },
          uiData: {
            // Default UI settings
            columnWidths: {},
            selectedCell: null
          }
        })
      });
      
      if (!createResponse.ok) {
        throw new Error(`Failed to create ${rulesheetName}: ${createResponse.status} ${await createResponse.text()}`);
      }
      
      const rulesheet = await createResponse.json();
      console.log(`✅ Created ${rulesheetName} with ID: ${rulesheet.id}`);
    }
    
    console.log('🎉 Successfully created 10 rulesheets!');
    
    // Verify by listing assets
    const assetsResponse = await fetch(`http://127.0.0.1:5000/api/projects/${demoProject.id}/assets`);
    if (assetsResponse.ok) {
      const assets = await assetsResponse.json();
      const rulesheets = assets.filter(a => a.type === 'rulesheets');
      console.log(`📊 Project now has ${rulesheets.length} rulesheets total`);
      console.log('Rulesheet names:', rulesheets.map(r => r.name));
    }
    
  } catch (error) {
    console.error('❌ Error creating rulesheets:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Execute the function
createRulesheets().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
