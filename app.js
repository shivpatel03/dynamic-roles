require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent] })
const memberPreferencesStart = new Map();
const memberPreferencesEnd = new Map();

function getPreferenceStart(memberId) {
    const preferenceStart = retrievePreferenceStartFromDatabase(memberId);
    
    return preferenceStart;
}

function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    return currentTime;
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', message => {
    
    const args = message.content.split(' ');

    // Check if the command is "!createRole" and the message has a role name
    if (args[0] === '!createRole' && args.length >= 2) {
        // Extract the role name from the message content
        const roleName = args.slice(1).join(' ');
        message.guild.roles.create({
            name: roleName,
            color: 0x3498db,
            reason: 'this is a test',
        })
            .then(console.log("role created"))
            .catch(console.error)
    }

    // input preferences as !setPreference 10:00 18:00 (military time)
    if (args[0] === '!setPreferences' && args.length >= 2) {
        const roleName = args.slice(1)[0];
        const timePreferenceStart = args.slice(1)[1];
        const timePreferenceEnd = args.slice(1)[2];
        // let member = (await guild.members.fetch({ user: messsage.author_id, force: true }));
        memberId = message.author.id;


        message.guild.roles.fetch(role => console.log(role.name, role.id))
        if (!message.guild.roles.cache.has(roleName)) {
            message.channel.send("role does not exist, would you like to make it?");
            client.on('messageCreate', msg => {
                if (msg.content === "yes") {
                    message.guild.roles.create({
                        name: role,
                        color: 0xFFFFFF,
                        reason: `Creating role for ${message.author.username}`
                    })
                        .then(message.channel.send("new role created"))
                        .catch(console.error)
                    var role = message.guild.roles.cache.find(role => role.name === roleName);
                    message.member.roles.add(role);
                }
                else {
                    console.log("nothing");
                }
            })
            return;
        }
        
        // check if the time is in military time
        if (timePreferenceStart.length !== 5 || timePreferenceEnd.length !== 5) {
            message.channel.send("Please input the time in military time (HH:MM)");
            return;
        }

        // check if the member has a starting preference already
        if (memberPreferencesStart.has(message.author.id) || memberPreferencesEnd.has(message.author.id)) {
            message.channel.send("Preferences updated");
            memberPreferencesStart.set(memberId, timePreferenceStart);
            memberPreferencesEnd.set(memberId, timePreferenceEnd);
        }

        else{
            message.channel.send("Preferences set");
            memberPreferencesStart.set(memberId, timePreferenceStart);
            memberPreferencesEnd.set(memberId, timePreferenceEnd);
        }
    }
});

client.login(process.env.KEY); // keep at bottom of file