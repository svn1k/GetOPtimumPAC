// ===================================================
// PAC-MAN OPTIMUM — Supabase Leaderboard
// ===================================================
'use strict';

// ---------------------------------------------------------------
// 1) FILL THESE IN with your own Supabase project's values.
//    Supabase dashboard -> Project Settings -> API
//    - "Project URL"        -> SUPABASE_URL
//    - "anon public" API key -> SUPABASE_ANON_KEY
// ---------------------------------------------------------------
const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-PUBLIC-KEY';

const NICKNAME_KEY = 'pacOptNickname';
const LEADERBOARD_LIMIT = 20;

// Shared page-switcher used by both this file and game.js, so the
// three top-level "pages" (landing / leaderboard / game) always agree
// on which one is visible.
function showAppPage(id) {
    document.querySelectorAll('.app-page').forEach((el) => el.classList.add('page-hidden'));
    const el = document.getElementById(id);
    if (el) el.classList.remove('page-hidden');
}
window.showAppPage = showAppPage;

const PacLeaderboard = (() => {
    const configured = !SUPABASE_URL.includes('YOUR-PROJECT') && !SUPABASE_ANON_KEY.includes('YOUR-ANON');
    const client = (configured && window.supabase)
        ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
        : null;

    function getNickname() {
        return localStorage.getItem(NICKNAME_KEY) || '';
    }

    function setNickname(name) {
        localStorage.setItem(NICKNAME_KEY, name);
    }

    function sanitizeNickname(raw) {
        return raw.trim().replace(/\s+/g, ' ').slice(0, 20);
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ---------- Nickname gate ----------
    function showNicknameGate(onDone) {
        const modal = document.getElementById('nickname-modal');
        const input = document.getElementById('nickname-input');
        const form = document.getElementById('nickname-form');
        const errorEl = document.getElementById('nickname-error');

        input.value = getNickname();
        errorEl.textContent = '';
        modal.classList.remove('hidden');
        setTimeout(() => input.focus(), 50);

        const handler = (e) => {
            e.preventDefault();
            const name = sanitizeNickname(input.value);
            if (name.length < 2) {
                errorEl.textContent = 'Nickname needs at least 2 characters';
                return;
            }
            setNickname(name);
            form.removeEventListener('submit', handler);
            modal.classList.add('hidden');
            if (onDone) onDone(name);
        };
        form.addEventListener('submit', handler);
    }

    // ---------- Leaderboard page ----------
    function updatePlayingAs() {
        const el = document.getElementById('lb-playing-as');
        if (!el) return;
        const name = getNickname();
        el.innerHTML = name ? `Playing as <strong>${escapeHtml(name)}</strong>` : '';
    }

    async function loadLeaderboard() {
        const listEl = document.getElementById('leaderboard-list');
        const stateEl = document.getElementById('leaderboard-state');
        if (!listEl || !stateEl) return;

        listEl.innerHTML = '';
        updatePlayingAs();

        if (!client) {
            stateEl.textContent = 'Leaderboard isn\u2019t configured yet — add your Supabase URL and key in leaderboard.js.';
            return;
        }

        stateEl.textContent = 'Loading\u2026';
        const { data, error } = await client
            .from('leaderboard')
            .select('nickname, score, level')
            .order('score', { ascending: false })
            .limit(LEADERBOARD_LIMIT);

        if (error) {
            console.error('Failed to load leaderboard:', error);
            stateEl.textContent = 'Could not load the leaderboard. Try again later.';
            return;
        }

        if (!data || data.length === 0) {
            stateEl.textContent = 'No scores yet — be the first!';
            return;
        }

        stateEl.textContent = '';
        const myName = getNickname();
        data.forEach((row, i) => {
            const rank = i + 1;
            const rankClass = rank === 1 ? 'lb-rank lb-rank--gold'
                : rank === 2 ? 'lb-rank lb-rank--silver'
                : rank === 3 ? 'lb-rank lb-rank--bronze'
                : 'lb-rank';
            const li = document.createElement('li');
            li.className = 'lb-row' + (row.nickname === myName ? ' lb-row--me' : '');
            li.innerHTML = `
                <span class="${rankClass}">${rank}</span>
                <span class="lb-name">${escapeHtml(row.nickname)}</span>
                <span class="lb-score">${row.score}</span>
            `;
            listEl.appendChild(li);
        });
    }

    function showLeaderboardPage() {
        showAppPage('leaderboard-page');
        loadLeaderboard();
    }

    // ---------- Score submission ----------
    async function submitScore(score, level) {
        if (!client) return;
        const nickname = getNickname();
        if (!nickname) return;
        try {
            const { error } = await client.rpc('submit_score', {
                p_nickname: nickname,
                p_score: Math.max(0, Math.round(score)),
                p_level: level || 1,
            });
            if (error) console.error('submit_score failed:', error);
        } catch (err) {
            console.error('submit_score error:', err);
        }
    }

    // ---------- Wiring ----------
    function init() {
        document.querySelectorAll('.js-open-leaderboard').forEach((btn) => {
            btn.addEventListener('click', () => showLeaderboardPage());
        });
        document.querySelectorAll('.js-open-landing').forEach((btn) => {
            btn.addEventListener('click', () => showAppPage('landing-page'));
        });
        const refreshBtn = document.getElementById('btn-refresh-leaderboard');
        if (refreshBtn) refreshBtn.addEventListener('click', () => loadLeaderboard());

        const changeBtn = document.getElementById('btn-change-nickname');
        if (changeBtn) changeBtn.addEventListener('click', () => showNicknameGate(() => loadLeaderboard()));

        // First-ever visit: ask for a nickname, then drop the player into the leaderboard.
        if (!getNickname()) {
            showNicknameGate(() => showLeaderboardPage());
        }
    }

    return { init, submitScore, getNickname, showLeaderboardPage };
})();

document.addEventListener('DOMContentLoaded', () => PacLeaderboard.init());
window.PacLeaderboard = PacLeaderboard;
