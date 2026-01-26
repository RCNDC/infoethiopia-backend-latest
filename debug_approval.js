const db = require("./models");

const jobId = "29145d30-6190-4100-a231-5255b6ec1c8b";

async function testApproval() {
    try {
        console.log("Connecting to DB...");
        const job = await db.JobPost.findOne({ where: { Id: jobId } });
        if (!job) {
            console.error("Job not found!");
            return;
        }
        // Log the plain data content
        console.log("JOB DATA:", JSON.stringify(job.get({ plain: true }), null, 2));

        // Log individual fields access check
        console.log("job.Body:", job.Body);
        console.log("job.body:", job.body);
        console.log("job.Title:", job.Title);
        console.log("job.title:", job.title);

    } catch (err) {
        console.error("General Error:", err);
    }
}

testApproval();
