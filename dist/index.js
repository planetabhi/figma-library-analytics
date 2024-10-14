import axios from 'axios';
import dotenv from 'dotenv';
import { createWriteStream } from 'fs';
import { format } from 'fast-csv';

const CONFIG = {
    START_DATE: process.env.START_DATE,
    END_DATE: process.env.END_DATE
};

dotenv.config();
const figma_access_token = process.env.FIGMA_ACCESS_TOKEN;
const file_key = process.env.FILE_KEY;
const base_url = 'https://api.figma.com/v1/analytics/libraries/';
const { START_DATE, END_DATE } = CONFIG;
async function fetchAllPages(url, headers) {
    let allData = [];
    let nextPage = true;
    let cursor = '';
    while (nextPage) {
        const response = await axios.get(url + (cursor ? `&cursor=${cursor}` : ''), { headers });
        const json_data = response.data;
        allData = allData.concat(json_data.rows || json_data.components || json_data.files);
        if (json_data.next_page) {
            cursor = json_data.cursor;
            console.log("Requesting next page: " + url + `&cursor=${cursor}`);
        }
        else {
            console.log("No new data. We're done");
            nextPage = false;
        }
    }
    return allData;
}
async function fetchReport(config) {
    const params = `/${config.endpoint}?group_by=${config.groupBy}&start_date=${START_DATE}&end_date=${END_DATE}&order=asc`;
    const url = base_url + file_key + params;
    const headers = { 'X-FIGMA-TOKEN': figma_access_token || '' };
    return await fetchAllPages(url, headers);
}
async function writeCSV(data, filename, headers) {
    const writeStream = createWriteStream(`output/${filename}.csv`);
    const csvHeaders = headers.map(header => header.title);
    format({ headers: csvHeaders })
        .pipe(writeStream)
        .on('finish', () => {
        console.log(`${filename}.csv has been written successfully`);
    })
        .on('error', (err) => {
        console.error(`Error writing ${filename}.csv:`, err);
    });
    data.forEach(record => {
        writeStream.write(record);
    });
    writeStream.end();
}
async function libraryAnalytics() {
    console.log('Starting Figma library analytics...');
    const reportConfigs = [
        {
            endpoint: 'actions',
            groupBy: 'component',
            filename: 'actions_by_component',
            headers: [
                { id: 'week', title: 'Week' },
                { id: 'component_key', title: 'Component Key' },
                { id: 'component_name', title: 'Component Name' },
                { id: 'detachments', title: 'Detachments' },
                { id: 'insertions', title: 'Insertions' }
            ]
        },
        {
            endpoint: 'actions',
            groupBy: 'team',
            filename: 'actions_by_team',
            headers: [
                { id: 'week', title: 'Week' },
                { id: 'team_name', title: 'Team Name' },
                { id: 'workspace_name', title: 'Workspace Name' },
                { id: 'detachments', title: 'Detachments' },
                { id: 'insertions', title: 'Insertions' }
            ]
        },
        {
            endpoint: 'usages',
            groupBy: 'component',
            filename: 'usages_by_component',
            headers: [
                { id: 'component_key', title: 'Component Key' },
                { id: 'component_name', title: 'Component Name' },
                { id: 'num_instances', title: 'Number of Instances' },
                { id: 'num_teams_using', title: 'Number of Teams Using' },
                { id: 'num_files_using', title: 'Number of Files Using' }
            ]
        },
        {
            endpoint: 'usages',
            groupBy: 'file',
            filename: 'usages_by_file',
            headers: [
                { id: 'team_name', title: 'Team Name' },
                { id: 'workspace_name', title: 'Workspace Name' },
                { id: 'file_name', title: 'File Name' },
                { id: 'num_instances', title: 'Number of Instances' }
            ]
        }
    ];
    try {
        for (const config of reportConfigs) {
            const data = await fetchReport(config);
            await writeCSV(data, config.filename, config.headers);
        }
        console.log('All Figma library analytics reports generated successfully!');
    }
    catch (error) {
        console.error('Error generating Figma library analytics reports:', error);
        throw error;
    }
}
if (typeof require !== 'undefined' && require.main === module) {
    libraryAnalytics().catch(console.error);
}

export { libraryAnalytics };
//# sourceMappingURL=index.js.map
