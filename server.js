const got = require('got');

const APIBasePath = `https://nflarrest.com/api/v1`;

function getTeamArrests(id) {
	console.log('getting specific team arrests');
	return got(`${APIBasePath}/team/arrests/${id}`);
}

function getAllTeamArrests() {
	console.log('getting all team arrests');
	return got(`${APIBasePath}/team/`);
}

function search(query) {
	console.log('searching');
	return got(`${APIBasePath}/team/search/?term=${query}`)
}

async function mainFunction(query) {
	if (!query) return {};

	const allTeamArrests = getAllTeamArrests().then(rawTeamArrestsResponse => {
		return JSON.parse(rawTeamArrestsResponse.body);
	});

	const allTeamDetails = search(query).then(async (rawResponse) => {
		const response = JSON.parse(rawResponse.body);

		if (!response.length) {
			return;
		}

		const [{teams_full_name: name, team_code: id, city}] = response;
		const rawArrestsResponse = await getTeamArrests(id);

		const arrestsResponse = JSON.parse(rawArrestsResponse.body);
		const arrests = arrestsResponse.map((arrest) => {
			//Name as name, Date as date, Position as position, Category as category, Outcome as outcome
			return {
				name: arrest.Name,
				date: arrest.Date,
				position: arrest.Position,
				category: arrest.Category,
				outcome: arrest.Outcome
			}
		});

		return {
			name,
			id,
			city,
			arrests,
			totalArrests: arrests.length,
		};
	})

	const [allTeamArrestsResults, allTeamDetailsResult] = await Promise.all([allTeamArrests, allTeamDetails])

	if (!allTeamDetailsResult) {
		return [];
	}

	return {
		...allTeamDetailsResult,
		teamOffendingRank: allTeamArrestsResults.findIndex(({Team: team}) => team === allTeamDetailsResult.id) + 1
	};
}

const express = require('express')
const app = express()
const port = 3000

app.get('/search', async (req, res) => {
	// e.g. Indianapolis or Denver
	const query = req.query.query;
	const response = await mainFunction(query);
	res.json(response);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))