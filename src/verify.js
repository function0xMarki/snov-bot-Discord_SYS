import dotenv from 'dotenv';
dotenv.config();
import fetch from "node-fetch";
import bjsMessage from "bitcoinjs-message";
import bitcoin from "bitcoinjs-lib";

import { FAIL, SUCCESS, ERROR } from "./constants.js";

// Syscoin Mainnet Configuration
const network = {
    messagePrefix: '\x18Syscoin Signed Message:\n',
    bech32: 'sys',
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4,
    },
    pubKeyHash: 0x3f,
    scriptHash: 0x05,
    wif: 0x80,
};

// generate a hashed message using the userID and secret
async function getMessageHash(userID) {
  const userBuff = Buffer.from(userID, "utf8");
  const secretBuff = Buffer.from(process.env.SECRET, "utf8");
  const data = Buffer.concat([ userBuff, secretBuff ]);
  const hash = await bitcoin.crypto.sha256(data).toString("hex");
  return hash;
}

// get the message/command for signing in the Syscoin QT wallet
export async function getSigningMessage(txid, userID) {
  try {
    const { status, address } = await getCollateralAddress(txid);
    const hashedMessage = await getMessageHash(userID);
    if (status === SUCCESS) {
      return { status, 
        message: `Unspent collateral has been found!\n
                  Please enter the following command into your Syscoin QT wallet console, this will output the signed message we can then use to verify if you own the collateral address:\n
                  > signmessage ${address} ${hashedMessage}\n
                  Please use the output from the previous step in the following command in Discord to verify your signed message:
                  > !verify ${txid} *signedMessage*`
        };
    } else {
      return { status, message: "Unspent collateral has not been found." };
    }
  } catch (err) {
    console.log(err);
    return { status: ERROR, message: "Error getting the signing message." };
  }
}

// check that the given address is associated with a sentry node in the mnlist
export async function isInSnList(address) {
  try {
      const response = await fetch(`${process.env.GOV_API_URL}/mnlist`);
      const snList = await response.json();

      for (const sn in snList) {
        if (address === snList[sn].collateraladdress) {
          return SUCCESS;
        }
      }
      
      return FAIL;
  } catch (error) {
    console.log(error);
    return ERROR;
  }
}

// gets the address the collateral was sent to, based on the collateral txid
export async function getCollateralAddress(txid) {
  try {
    const response = await fetch(`${process.env.API_URL}/tx/${txid}`);
    const data = await response.json();
    const vouts = data.vout;
    let collateral = null;

    if (vouts !== undefined) {
      for (let i = 0; i < vouts.length; i++) {
        if (vouts[i].value === "100000" && !vouts[i].spent) {
          collateral = vouts[i];
          break;
        }
      }
      if (collateral !== null) {
        return { status: SUCCESS, address: collateral.scriptPubKey.addresses[0] }
      }
    }
    return { status: FAIL, address: null }
  } catch (error) {
    console.error(error);
    return { status: ERROR, address: null }
  }
}

// bitcoinmessage-js only works with legacy addresses, so convert to legacy before verifying
function convertBech32ToLegacy(bech32Address) {
  const decoded = bitcoin.address.fromBech32(bech32Address, network);
  const p2pkh = bitcoin.payments.p2pkh({ hash: decoded.data, network: network });
  return p2pkh.address;
}

// verify message, address and signature are all as expected
export async function verifySignature(userID, address, signature) {
	try {
		const prefix = address.slice(0, 3);
		if (prefix === "sys") {
			address = convertBech32ToLegacy(address);
		}

    const hashedMessage = await getMessageHash(userID);

	  return bjsMessage.verify(
	    hashedMessage,
	    address,
	    signature,
	    network.messagePrefix
	  );
	} catch (err) {
		console.log(err);
    return false;
	}
}