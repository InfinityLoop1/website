// credit to oscdev for the original code

const DISCORD_USER_ID = '1184305500062502996';

async function fetchDiscordData() {
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
        const data = await response.json();
        if (data.success && data.data) {
            return data.data;
            console.log(data.data);
        } else {
            return null;
            console.error('Failed to fetch Discord data:', data);
        }
    } catch (error) {
        return null;
        console.error('Error fetching Discord data:', error);
    }
}

function updatePFP(userData) {
    const pfpImage = document.getElementById('discord-pfp');
    if (pfpImage && userData.discord_user && userData.discord_user.avatar) {
        const avatarHash = userData.discord_user.avatar;
        const userId = userData.discord_user.id;
        const pfpUrl = `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png?size=256`;
        pfpImage.src = pfpUrl;
        pfpImage.alt = `${userData.discord_user.username}'s Profile Picture`;
    } else if (pfpImage) {
        pfpImage.src = "placeholder.png";
        pfpImage.alt = "Discord Profile Picture (unavailable)";
    }
}

function updateUsername(userData) {
    const usernameText = document.getElementById('discord-username-text');
    if (usernameText && userData.discord_user && userData.discord_user.username && userData.discord_user.global_name) {
        const avatarHash = userData.discord_user.avatar;
        const userId = userData.discord_user.id;
        usernameText.innerHTML = userData.discord_user.global_name + "<small> (" + userData.discord_user.username + ")</small>";
    } else if (usernameText) {
        usernameText.textContent = "Unknown User";
    }
}

function updateStatus(userData) {
    const statusTextElement = document.getElementById('discord-status-text');
    const pfpImage = document.getElementById('discord-pfp');

    if (statusTextElement && pfpImage && userData.discord_status) {
        let statusText = userData.discord_status;
        let statusClass = '';

        switch (statusText) {
            case 'online':
                statusText = 'Online';
                statusClass = 'status-online';
                break;
            case 'idle':
                statusText = 'Idle';
                statusClass = 'status-idle';
                break;
            case 'dnd':
                statusText = 'Do Not Disturb';
                statusClass = 'status-dnd';
                break;
            case 'offline':
            default:
                statusText = 'Offline';
                statusClass = 'status-offline';
                break;
        }
        statusTextElement.textContent = statusText;
        pfpImage.className = 'avatar-image ' + statusClass;
    } else {
        console.log(userData.discord_status);
        if (statusTextElement) statusTextElement.textContent = 'Unknown';
        if (statusDotElement) statusDotElement.className = 'status-dot';
        if (pfpImage) pfpImage.className = 'avatar-image';
    }
}

function updateActivity(userData) {
    const activityElement = document.getElementById('discord-activity-text');
    if (activityElement) {
        activityElement.innerHTML = '';
        if (userData.activities && userData.activities.length > 0) {
            const displayableActivities = userData.activities.filter(activity =>
                activity.type !== 4
            );

            if (displayableActivities.length > 0) {
                const activity = displayableActivities[0];
                let activityString = '';
                switch (activity.type) {
                    case 0:
                        if (activity.name === "Code") {
                            activityString = "Using Visual Studio Code";
                        } else {
                            activityString = `Playing ${activity.name}`;
                            
                        }   
                        if (activity.details) activityString += `: ${activity.details}`;
                        break;
                    case 1:
                        activityString = `Streaming ${activity.name}`;
                        if (activity.details) activityString += `: ${activity.details}`;
                        break;
                    case 2:
                        if (activity.name === 'Spotify' && activity.details && activity.state) {
                            activityString = `Listening to ${activity.details} by ${activity.state}`;
                        } else {
                            activityString = `Listening to ${activity.name}`;
                            if (activity.state) activityString += ` by ${activity.state}`;
                        }
                        break;
                    case 3:
                        activityString = `Watching ${activity.name}`;
                        if (activity.details) activityString += `: ${activity.details}`;
                        break;
                    default:
                        activityString = `Doing ${activity.name}`;
                        if (activity.details) activityString += `: ${activity.details}`;
                        break;
                }
                activityElement.textContent = activityString;
            } else {
                activityElement.textContent = 'No current activity.';
            }
        } else {
            activityElement.textContent = 'No current activity.';
        }
    }
}

async function updateDiscordDisplay() {
    const userData = await fetchDiscordData();
    if (userData) {
        updatePFP(userData);
        updateStatus(userData);
        updateActivity(userData);
        updateUsername(userData);
    } else {
        const statusTextElement = document.getElementById('discord-status-text');
        const activityElement = document.getElementById('discord-activity-text');
        const pfpImage = document.getElementById('discord-pfp');

        if (statusTextElement) statusTextElement.textContent = 'Unavailable';
        if (pfpImage) {
            pfpImage.src = "placeholder.png";
            pfpImage.alt = "Discord Profile Picture (unavailable)";
            pfpImage.className = 'avatar-image status-offline';
        }
        if (activityElement) activityElement.textContent = 'Discord data unavailable.';
    }
}

updateDiscordDisplay();
setInterval(updateDiscordDisplay, 10000);