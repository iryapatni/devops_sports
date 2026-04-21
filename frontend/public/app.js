document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-team-form');
    const submitBtn = document.getElementById('submit-btn');
    const statusMsg = document.getElementById('status-message');
    const teamsBody = document.getElementById('teams-body');
    const refreshBtn = document.getElementById('refresh-btn');
    const loader = document.querySelector('.loader');
    const btnText = submitBtn.querySelector('span');

    const API_URL = '/api/teams';

    // Fetch and display teams
    const loadTeams = async () => {
        try {
            refreshBtn.classList.add('spinning'); // optional CSS animation hook
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const teams = await response.json();
            renderTeams(teams);
        } catch (error) {
            console.error('Error fetching teams:', error);
            teamsBody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="3" class="error">Failed to connect to the backend API. Ensure Docker containers are running.</td>
                </tr>
            `;
        } finally {
            refreshBtn.classList.remove('spinning');
        }
    };

    // Render teams into table
    const renderTeams = (teams) => {
        if (!teams || teams.length === 0) {
            teamsBody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="3">No teams found. Register one above!</td>
                </tr>
            `;
            return;
        }

        teamsBody.innerHTML = '';
        teams.forEach(team => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${team.id}</td>
                <td>${team.city}</td>
                <td style="font-weight: 600; color: var(--primary);">${team.name}</td>
            `;
            teamsBody.appendChild(row);
        });
    };

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const city = document.getElementById('city').value.trim();
        
        if (!name || !city) return;

        // UI Loading state
        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        loader.classList.remove('hidden');
        statusMsg.textContent = '';
        statusMsg.className = 'status-message';

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, city }),
            });

            if (!response.ok) {
                throw new Error('Failed to create team');
            }

            // Success
            statusMsg.textContent = 'Successfully deployed team to database!';
            statusMsg.classList.add('success');
            form.reset();
            
            // Reload table to show new entry
            await loadTeams();
            
        } catch (error) {
            statusMsg.textContent = 'Error: ' + error.message;
            statusMsg.classList.add('error');
        } finally {
            submitBtn.disabled = false;
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
        }
    });

    // Refresh button event
    refreshBtn.addEventListener('click', loadTeams);

    // Initial load
    loadTeams();
});
