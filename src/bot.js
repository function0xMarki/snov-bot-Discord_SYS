import dotenv from 'dotenv';
dotenv.config();
import { EmbedBuilder } from "discord.js";

import { FAIL, SUCCESS, ERROR } from "./constants.js";

// sends a DM to the user with the specified userID
export async function sendDM(client, userID, status, message) {
  try {
    const user = await client.users.fetch(userID);
    let embed = new EmbedBuilder()
      .setColor("#ff0000")
      .setTitle("Failure...")
      .setDescription(message);

    if (status === SUCCESS) {
      embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Success!")
        .setDescription(message);
    }

    await user.send({ embeds: [embed] });
  } catch (error) {
    console.log(error);
  }
}

// sends a DM to the user with the specified userID when they have been successfully verified
export async function sendVerifiedDM(client, userID, message) {
  try {
    const user = await client.users.fetch(userID);

    const embed = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle("Success!")
      .setDescription(message)
      .setImage("https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExODdiejh5OWx5YzQ1c3B4cWJ6aXowY2Y1czMybHlkMHE0NmR0c3U0aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/g9582DNuQppxC/giphy.gif");

    await user.send({ embeds: [embed] });
  } catch (error) {
    console.log(error);
  }
}

export async function sendChannelArrivalMessage(client, userID) {
  try {
    const channel = await client.channels.fetch(process.env.CHANNEL_ID);
    const user = await client.users.fetch(userID);

    const embed = new EmbedBuilder()
      .setColor("#0000ff")
      .setTitle("A new Sentry Node Holder appears!")
      .setDescription(`Welcome to ${user.toString()}!`)
      .setImage("https://media1.tenor.com/m/MwUf8F3f1ewAAAAd/syscoin.gif");

    await channel.send({ embeds: [embed] });
    
    const welcomeGif = await channel.send('GIPHY URL');
    await new Promise(resolve => setTimeout(resolve, 60000));
    await welcomeGif.delete();
  } catch (error) {
    console.log(error);
  }

}

// enables access to the OG channel for the user with the specified userID
export async function enableChannelAccess(client, userID) {
  const channel = await client.channels.fetch(process.env.CHANNEL_ID);

  if (channel) {
    try {
      const user = await client.users.fetch(userID);
      const enabled = await channel.permissionOverwrites.create(user, {
        ViewChannel: true,
        SendMessages: true
      });

      console.log(`Successfully enabled access for: ${userID}`);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  return false;
}

// disables access to the OG channel for the user with the specified userID
export async function disableChannelAccess(client, userID) {
  const channel = await client.channels.fetch(process.env.CHANNEL_ID);

  if (channel) {
    try {
      const user = await client.users.fetch(userID);
      const disabled = await channel.permissionOverwrites.create(user, {
        ViewChannel: false,
        SendMessages: false
      });

      console.log(`Successfully disabled access for: ${userID}`);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  return false;
}
