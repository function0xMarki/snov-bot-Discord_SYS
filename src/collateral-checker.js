import dotenv from 'dotenv';
dotenv.config();
import fetch from "node-fetch";
import schedule from 'node-schedule';

import { FAIL, SUCCESS, ERROR } from "./constants.js";
import { getAllUsersDB, removeUserFromDB } from "./db.js";
import { getCollateralAddress } from "./verify.js";
import { disableChannelAccess } from "./bot.js";

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//
// runs daily at midnight
// check all users to see if they are in the mnlist, if not check if they moved their collateral
// if they moved their collateral then disable their access to the private channel and remove them from the DB
export const dailyTask = async (client) => {
	schedule.scheduleJob('0 0 0 * * *', async () => {
		console.log("Running daily collateral check...")
		try {
	    const response = await fetch(`${process.env.GOV_API_URL}/mnlist`);
	    const snList = await response.json();

	    const allUsers = await getAllUsersDB();
	    let missingNodeUsers = [];
	    for (let i = 0; i < allUsers.length; i++) {
	    	let missing = true;
	    	for (const sn in snList) {
	    		if (allUsers[i].address === snList[sn].collateraladdress) {
	    			missing = false;
	    			break;
	    		}
	    	}

	    	if (missing) {
	    		missingNodeUsers.push(allUsers[i]);
	    	}
	    }

	    for (let i = 0; i < missingNodeUsers.length; i++) {
	    	const collateralTxid = missingNodeUsers[i].txid;
	    	let { status, address } = await getCollateralAddress(collateralTxid);

	    	if (status === FAIL) {
	    		const disabledChannelAccess = await disableChannelAccess(client, missingNodeUsers[i].id);
	    		if (disabledChannelAccess) {
		    		const removedFromDB = await removeUserFromDB(missingNodeUsers[i].id);
		    		if (removedFromDB) console.log("Removed from DB: " + missingNodeUsers[i].id);
	    		}
	    	}

		    await delay(2000); // wait for 2 seconds to not spam the Blockbook API too quickly
	    }

	    console.log('Daily collateral check complete! Beep boop.');
		} catch (error) {
			console.log(error);
		}
	});
}
