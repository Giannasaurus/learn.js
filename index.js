const { MongoClient } = require('mongodb')

async function runGetStarted() {
    const 
    const client = new MongoClient(URI)
    
    try {
        await client.connect()
        console.log('connected to database')
        
        const database = client.db('basics')
        const syntax = database.collection('syntax')
        
        console.log(`Syntax collection: ${syntax}`)
    }
    catch (e) {
        console.error(e)
    }
    finally {
        await client.close()
    }
}

runGetStarted().catch(console.error)