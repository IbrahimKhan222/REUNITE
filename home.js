// home.js - extracted from home.html
const baseUrl = 'http://localhost:3000';
let currentCollege = null;
let currentBranch = null;
let collegesData = [];
let branchesData = [];
let alumniData = [];

async function fetchColleges() {
    try {
        showLoading('Loading colleges...');
        const response = await fetch(`${baseUrl}/api/colleges`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        collegesData = await response.json();
        console.log('Fetched colleges:', collegesData);
        renderColleges();
    } catch (error) {
        console.error('Error fetching colleges:', error);
        showError(`Unable to load colleges: ${error.message}`);
    }
}

function renderColleges(filter = '') {
    const resultDiv = document.getElementById('result');
    const filteredColleges = collegesData.filter(college => college.toLowerCase().includes(filter.toLowerCase()));
    // Map college names to logo image paths
    const logoMap = {
      "deccan college of engineering and technology": "/logos/dcet.png",
      "lords institute of science and technology": "/logos/lords.png",
      "muffakham jah college of engineering & technology": "/logos/mj.png"
    };
    if (filteredColleges.length === 0) {
        let message = filter
            ? `No colleges found matching "${filter}".`
            : 'No colleges found in the database.';
        resultDiv.innerHTML = `<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">${message}</div>`;
    } else {
        const collegeCards = filteredColleges.map((college, index) => {
            const key = college.trim().toLowerCase();
            return `
            <div class="college-card" data-college="${college}" data-index="${index}">
                <img src="${logoMap[key] || '/logos/default.png'}" class="w-full rounded-lg mb-2" alt="${college} Logo">
                <h3>${college}</h3>
                <p>Explore branches and connect with alumni from this institution</p>
            </div>
            `;
        }).join('');
        resultDiv.innerHTML = `
            <div class="text-center mb-8">
                <h2 class="text-3xl font-bold text-gray-900 mb-2">Let's start by exploring people from your college on LinkedIn</h2>
                <p class="text-lg text-gray-600">Select your institution to explore branches and connect with fellow alumni</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${collegeCards}
            </div>
        `;
        document.querySelectorAll('.college-card').forEach(card => {
            card.addEventListener('click', function() {
                const college = this.getAttribute('data-college');
                fetchBranches(college);
            });
        });
    }
}

async function fetchBranches(college) {
    try {
        currentCollege = college;
        currentBranch = null;
        showLoading('Loading branches...');
        const response = await fetch(`${baseUrl}/api/branches/${encodeURIComponent(college)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        branchesData = await response.json();
        console.log('Fetched branches:', branchesData);
        renderBranches();
    } catch (error) {
        console.error('Error fetching branches:', error);
        showError(`Unable to load branches: ${error.message}`);
    }
}

function renderBranches(filter = '') {
    const resultDiv = document.getElementById('result');
    const filteredBranches = filter 
        ? branchesData.filter(branch => branch.toLowerCase().includes(filter.toLowerCase()))
        : branchesData;
    const backButton = `
        <button onclick="fetchColleges()" class="mb-6 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Colleges
        </button>
    `;
    const breadcrumb = `
        <nav class="mb-6 bg-gray-50 px-4 py-2 rounded-lg">
            <span onclick="fetchColleges()" class="cursor-pointer text-blue-600 hover:text-blue-800">Colleges</span> 
            <span class="text-gray-500 mx-2">></span>
            <span class="text-gray-900 font-medium">${currentCollege}</span>
        </nav>
    `;
    if (!branchesData || branchesData.length === 0) {
        resultDiv.innerHTML = `
            ${backButton}
            ${breadcrumb}
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">No branches found for this college.</div>
        `;
        return;
    }
    if (filteredBranches.length === 0) {
        resultDiv.innerHTML = `
            ${backButton}
            ${breadcrumb}
            <div class="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                No branches found matching "${filter}". Showing all branches instead.
            </div>
            <div class="text-center my-8">
                <h2 class="text-3xl font-bold text-gray-900 mb-2">Branches at ${currentCollege}</h2>
                <p class="text-lg text-gray-600">Select a department to view profiles and connect with people</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${branchesData.map((branch, index) => `
                    <div class="branch-card" data-college="${currentCollege}" data-branch="${branch}" data-index="${index}">
                        <div class="card-icon">📚</div>
                        <h3>${branch}</h3>
                        <p>Connect with ${branch} graduates from ${currentCollege}</p>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        resultDiv.innerHTML = `
            ${backButton}
            <div class="text-center mb-8">
                <h2 class="text-3xl font-bold text-gray-900 mb-2">Branches at ${currentCollege}</h2>
                <p class="text-lg text-gray-600">Select a department to view profiles and connect with people</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${filteredBranches.map((branch, index) => `
                    <div class="branch-card" data-college="${currentCollege}" data-branch="${branch}" data-index="${index}">
                        <div class="card-icon">📚</div>
                        <h3>${branch}</h3>
                        <p>Connect with ${branch} graduates from ${currentCollege}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
    document.querySelectorAll('.branch-card').forEach(card => {
        card.addEventListener('click', function() {
            const college = this.getAttribute('data-college');
            const branch = this.getAttribute('data-branch');
            fetchAlumni(college, branch);
        });
    });
}

async function fetchAlumni(college, branch) {
    try {
        currentBranch = branch;
        showLoading('Loading alumni profiles...');
        const response = await fetch(`${baseUrl}/api/alumni/${encodeURIComponent(college)}/${encodeURIComponent(branch)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        alumniData = await response.json();
        console.log('Fetched alumni:', alumniData);
        renderAlumni();
    } catch (error) {
        console.error('Error fetching alumni:', error);
        showError(`Unable to load alumni profiles: ${error.message}`);
    }
}

function renderAlumni(filter = '') {
    const resultDiv = document.getElementById('result');
    const filteredAlumni = filter
        ? alumniData.filter(person => 
            person.name.toLowerCase().includes(filter.toLowerCase()) ||
            (person.bio && person.bio.toLowerCase().includes(filter.toLowerCase())))
        : alumniData;
    const backButton = `
        <button onclick="fetchBranches('${currentCollege}')" class="mb-6 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Branches
        </button>
    `;
    const breadcrumb = `
        <nav class="mb-6 bg-gray-50 px-4 py-2 rounded-lg">
            <span onclick="fetchColleges()" class="cursor-pointer text-blue-600 hover:text-blue-800">Colleges</span> 
            <span class="text-gray-500 mx-2">></span>
            <span onclick="fetchBranches('${currentCollege}')" class="cursor-pointer text-blue-600 hover:text-blue-800">${currentCollege}</span> 
            <span class="text-gray-500 mx-2">></span>
            <span class="text-gray-900 font-medium">${currentBranch}</span>
        </nav>
    `;
    if (!alumniData || alumniData.length === 0) {
        resultDiv.innerHTML = `
            ${backButton}
            ${breadcrumb}
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">No alumni profiles found for this branch yet.</div>
        `;
        return;
    }
    if (filteredAlumni.length === 0) {
        resultDiv.innerHTML = `
            ${backButton}
            ${breadcrumb}
            <div class="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                No alumni profiles found matching "${filter}". Showing all profiles instead.
            </div>
            <div class="text-center my-8">
                <h2 class="text-3xl font-bold text-gray-900 mb-2">People from ${currentBranch} department at ${currentCollege}</h2>
                <p class="text-lg text-gray-600">Connect with people from ${currentBranch} department at ${currentCollege}</p>
            </div>
            <div class="space-y-6">
                ${alumniData.map(person => `
                    <div class="alumni-card">
                        <h3>👤 ${person.name}</h3>
                        <p><span class="detail-label">About:</span> ${person.bio || 'Bio not available'}</p>
                        <p><span class="detail-label">Graduation Year:</span> ${person.year || 'Not specified'}</p>
                        <p><span class="detail-label">Department:</span> ${currentBranch}</p>
                        <p><span class="detail-label">College:</span> ${currentCollege}</p>
                        ${person.linkedin ? `<p><a href="${person.linkedin}" target="_blank">🔗 Connect on LinkedIn</a></p>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        resultDiv.innerHTML = `
            ${backButton}
            ${breadcrumb}
            <div class="text-center mb-8">
                <h2 class="text-3xl font-bold text-gray-900 mb-2">People from ${currentBranch} department at ${currentCollege}</h2>
                <p class="text-lg text-gray-600">Connect with people from ${currentBranch} department at ${currentCollege}</p>
            </div>
            <div class="space-y-6">
                ${filteredAlumni.map(person => `
                    <div class="alumni-card">
                        <h3>👤 ${person.name}</h3>
                        <p><span class="detail-label">About:</span> ${person.bio || 'Bio not available'}</p>
                        <p><span class="detail-label">Graduation Year:</span> ${person.year || 'Not specified'}</p>
                        <p><span class="detail-label">Department:</span> ${currentBranch}</p>
                        <p><span class="detail-label">College:</span> ${currentCollege}</p>
                        ${person.linkedin ? `<p><a href="${person.linkedin}" target="_blank">🔗 Connect on LinkedIn</a></p>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
}

function showLoading(message) {
    document.getElementById('result').innerHTML = `<div class="loading">${message}</div>`;
}

function showError(message) {
    document.getElementById('result').innerHTML = `<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">${message}</div>`;
}

const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');

async function updateNavbarProfile() {
    const authBtn = document.getElementById('authBtn');
    const profileLink = document.getElementById('navbarProfileLink');
    const profilePic = document.getElementById('navbarProfilePic');
    if (token) {
        try {
            const response = await fetch(`${API_URL}/users/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Not authenticated');
            const data = await response.json();
            profilePic.src = (data.profilePicture && data.profilePicture !== 'default-avatar.png')
                ? `http://localhost:5000/${data.profilePicture}`
                : 'client/images/default-avatar.png';
            authBtn.style.display = 'none';
            profileLink.style.display = 'inline-block';
        } catch (err) {
            authBtn.style.display = 'inline-block';
            profileLink.style.display = 'none';
            profilePic.src = 'client/images/default-avatar.png';
        }
    } else {
        authBtn.style.display = 'inline-block';
        profileLink.style.display = 'none';
        profilePic.src = 'client/images/default-avatar.png';
    }
}
document.addEventListener('DOMContentLoaded', updateNavbarProfile);

document.addEventListener('DOMContentLoaded', function() {
    updateNavbarProfile();
    fetchColleges();
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', e => {
        const searchTerm = e.target.value.trim().toLowerCase();
        if (currentCollege === null) {
            renderColleges(searchTerm);
        } else if (currentBranch === null) {
            renderBranches(searchTerm);
        } else {
            renderAlumni(searchTerm);
        }
    });
});
