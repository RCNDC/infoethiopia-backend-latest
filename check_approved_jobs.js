const db = require("./models");

const checkData = async () => {
    try {
        console.log("Checking Approved Job table...");
        const jobs = await db.ApprovedJob.findAll();
        console.log("Total Approved Jobs:", jobs.length);
        if (jobs.length > 0) {
            console.log("First Job:", JSON.stringify(jobs[0], null, 2));

            // Also check if there are any jobs with a companyId
            const jobsWithCompany = jobs.filter(j => j.companyId);
            console.log("Jobs with companyId:", jobsWithCompany.length);
            if (jobsWithCompany.length > 0) {
                console.log("First Job with CompanyId:", JSON.stringify(jobsWithCompany[0], null, 2));
            }
        } else {
            console.log("No approved jobs found in the table.");
        }
    } catch (error) {
        console.error("Error fetching approved jobs:", error);
    }
};

checkData();
