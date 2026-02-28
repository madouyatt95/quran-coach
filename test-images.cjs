const https = require('https');

function get(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Node.js' } }, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => resolve(JSON.parse(d)));
        }).on('error', reject);
    });
}

async function main() {
    try {
        const repos = await get('https://api.github.com/search/repositories?q=quran+images');
        for (const repo of repos.items.slice(0, 5)) {
            console.log(`\nRepo: ${repo.full_name}, Branch: ${repo.default_branch}`);
            const tree = await get(`https://api.github.com/repos/${repo.full_name}/git/trees/${repo.default_branch}?recursive=1`);
            if (tree.tree) {
                const pages = tree.tree.filter(t => t.path.includes('page001') || t.path.includes('/1.png') || t.path.includes('page1'));
                console.log(pages.slice(0, 3).map(p => p.path));
            } else {
                console.log('No tree found or blocked.');
            }
        }
    } catch (e) { console.error(e); }
}

main();
