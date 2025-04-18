import dotenv from 'dotenv';
dotenv.config();
import { EmbedBuilder } from "discord.js";

import { DEFAULT, FAIL, SUCCESS, ERROR } from "./constants.js";

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
    } else if (status === DEFAULT) {
      embed = new EmbedBuilder()
        .setColor("#0061ff")
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
      .setImage("https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExeXB2b3phbXRxajl2MjZ5bGxyazJjZ2lraGUyMTJybm56ZmZxbGs4dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/smN9HBwCAQLBkgHhLN/giphy.gif");

    await user.send({ embeds: [embed] });
  } catch (error) {
    console.log(error);
  }
}

// sends a welcome message to the newly verified sentry node holder in the private channel
export async function sendChannelArrivalMessage(client, userID) {
  try {
    const channel = await client.channels.fetch(process.env.CHANNEL_ID);
    const user = await client.users.fetch(userID);

    const gifArr = [
      "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTU4ZGk0OG1iam9lZzJpazE4MWZtN2N0MGpsZHZsdDgzdW9qd2tlcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/PZgtEuy76gx7A38ZI9/giphy.gif",
      "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZjR5MzU3enAzZXh3aHJuZzdtazg1ajVicWFvdHpyMGhreXprenI3cCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/U6R97Psb07BSKkNU8T/giphy.gif"
    ]

    const embed = new EmbedBuilder()
      .setColor("#0061ff")
      .setTitle("A new Sentry Node Holder appears!")
      .setDescription(`Welcome to ${user.toString()}!\n The Sentry Node clan grows stronger by one!`)
      .setImage("https://media1.tenor.com/m/MwUf8F3f1ewAAAAd/syscoin.gif");

    await channel.send({ embeds: [embed] });

    const welcomeGif = await channel.send(gifArr[Math.floor(Math.random() * gifArr.length)]);
    await new Promise(resolve => setTimeout(resolve, 60000));
    await welcomeGif.delete();
  } catch (error) {
    console.log(error);
  }
}

// enables access to the private channel for the user with the specified userID
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

// disables access to the private channel for the user with the specified userID
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
