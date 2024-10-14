import axios from 'axios';
import { createObjectCsvWriter } from 'csv-writer';
import dotenv from 'dotenv';

dotenv.config();

// Environment variables
const figma_access_token = process.env.FIGMA_ACCESS_TOKEN;
const file_key = process.env.FILE_KEY;

// Base URL
const base_url = 'https://api.figma.com/v1/analytics/libraries/';

// Set the dates 
const start_date = '2024-01-01';
const end_date = '2024-04-05';

// Helper function to handle pagination
async function fetchAllPages(url: string, headers: Record<string, string>): Promise<any[]> {
    let allData: any[] = [];
    let nextPage = true;
    let cursor = '';

    while (nextPage) {
        const response = await axios.get(url + (cursor ? `&cursor=${cursor}` : ''), { headers });
        const json_data = response.data;
        allData = allData.concat(json_data.rows || json_data.components || json_data.files);

        if (json_data.next_page) {
            cursor = json_data.cursor;
            console.log("Requesting next page: " + url + `&cursor=${cursor}`);
        } else {
            console.log("No new data. we're done");
            nextPage = false;
        }
    }

    return allData;
}

// Actions by Component
async function actions_by_component(): Promise<void> {
    const params = `/actions?group_by=component&start_date=${start_date}&end_date=${end_date}&order=asc`;
    const url = base_url + file_key + params;
    const headers = { 'X-FIGMA-TOKEN': figma_access_token || '' };

    const data = await fetchAllPages(url, headers);

    const csvWriter = createObjectCsvWriter({
        path: 'output/actions_by_component.csv',
        header: [
            { id: 'week', title: 'Week' },
            { id: 'component_key', title: 'Component Key' },
            { id: 'component_name', title: 'Component Name' },
            { id: 'detachments', title: 'Detachments' },
            { id: 'insertions', title: 'Insertions' }
        ]
    });

    await csvWriter.writeRecords(data);
}

// Actions by Team
async function actions_by_team(): Promise<void> {
    const params = `/actions?group_by=team&start_date=${start_date}&end_date=${end_date}&order=asc`;
    const url = base_url + file_key + params;
    const headers = { 'X-FIGMA-TOKEN': figma_access_token || '' };

    const data = await fetchAllPages(url, headers);

    const csvWriter = createObjectCsvWriter({
        path: 'output/actions_by_team.csv',
        header: [
            { id: 'week', title: 'Week' },
            { id: 'team_name', title: 'Team Name' },
            { id: 'workspace_name', title: 'Workspace Name' },
            { id: 'detachments', title: 'Detachments' },
            { id: 'insertions', title: 'Insertions' }
        ]
    });

    await csvWriter.writeRecords(data);
}

// Usages by Component
async function usages_by_component(): Promise<void> {
    const params = `/usages?group_by=component&start_date=${start_date}&end_date=${end_date}&order=asc`;
    const url = base_url + file_key + params;
    const headers = { 'X-FIGMA-TOKEN': figma_access_token || '' };

    const data = await fetchAllPages(url, headers);

    const csvWriter = createObjectCsvWriter({
        path: 'output/usages_by_component.csv',
        header: [
            { id: 'component_key', title: 'Component Key' },
            { id: 'component_name', title: 'Component Name' },
            { id: 'num_instances', title: 'Number of Instances' },
            { id: 'num_teams_using', title: 'Number of Teams Using' },
            { id: 'num_files_using', title: 'Number of Files Using' }
        ]
    });

    await csvWriter.writeRecords(data);
}

// Usages by File
async function usages_by_file(): Promise<void> {
    const params = `/usages?group_by=file&start_date=${start_date}&end_date=${end_date}&order=asc`;
    const url = base_url + file_key + params;
    const headers = { 'X-FIGMA-TOKEN': figma_access_token || '' };

    const data = await fetchAllPages(url, headers);

    const csvWriter = createObjectCsvWriter({
        path: 'output/usages_by_file.csv',
        header: [
            { id: 'team_name', title: 'Team Name' },
            { id: 'workspace_name', title: 'Workspace Name' },
            { id: 'file_name', title: 'File Name' },
            { id: 'num_instances', title: 'Number of Instances' }
        ]
    });

    await csvWriter.writeRecords(data);
}

async function main(): Promise<void> {
    await actions_by_component();
    await actions_by_team();
    await usages_by_component();
    await usages_by_file();
}

main().catch(console.error);