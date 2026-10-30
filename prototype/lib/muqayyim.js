/* المقيّم — shared store + scoring rules. Classic script → window.Muq */
(function () {
  if (window.Muq) return;
  var KEY = 'muq.db.v1';
  var db = null, loading = null, subs = new Set();
  var MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

  function persist() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }
  function notify() { subs.forEach(function (f) { try { f(); } catch (e) { console.error(e); } }); }
  function r2(n) { return Math.round(n * 100) / 100; }

  var Muq = {
    ACCENTS: ['#1F6F5C', '#8A3B2E', '#2D4F86', '#7A5A14', '#5A3F84', '#26282C'],
    STATUS: { draft: 'مسودة', judging: 'تحكيم جارٍ', locked: 'مقفلة', revealed: 'أُعلنت' },
    DEVICES: { phone: [390, 844], laptop: [1440, 900], projector: [1920, 1080], card: [1080, 1350] },

    load: function () {
      if (db) return Promise.resolve(db);
      if (loading) return loading;
      loading = (async function () {
        var s = null;
        try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
        if (s && s.competitions) { db = s; return db; }
        var r = await fetch('data/sample-data.json');
        db = await r.json();
        db.ui = {};
        persist();
        return db;
      })();
      return loading;
    },
    get db() { return db; },
    subscribe: function (f) { subs.add(f); return function () { subs.delete(f); }; },
    update: function (fn) { fn(db); persist(); notify(); },
    reset: async function () { localStorage.removeItem(KEY); db = null; loading = null; await Muq.load(); notify(); },

    /* lookups */
    comp: function (id) { return db.competitions.find(function (c) { return c.id === id; }); },
    status: function (comp, p) { return (p && p.status) || comp.status; },
    criteria: function (cid) { return db.criteria.filter(function (k) { return k.competitionId === cid; }).sort(function (a, b) { return a.order - b.order; }); },
    groups: function (cid) { return db.groups.filter(function (g) { return g.competitionId === cid; }); },
    assignments: function (cid) { return db.assignments.filter(function (a) { return a.competitionId === cid && !a.removed; }); },
    judge: function (id) { return db.judges.find(function (j) { return j.id === id; }); },
    byToken: function (t) { return db.assignments.find(function (a) { return a.token === t && !a.removed; }); },
    maxTotal: function (cid) { return Muq.criteria(cid).reduce(function (s, k) { return s + k.maxPoints; }, 0); },
    hasScores: function (cid) { return db.scores.some(function (s) { return s.competitionId === cid; }); },

    /* scores */
    score: function (j, g, k) {
      var s = db.scores.find(function (s) { return s.judgeId === j && s.groupId === g && s.criterionId === k; });
      return s ? s.value : null;
    },
    setScore: function (cid, j, g, k, v) {
      var max = (db.criteria.find(function (c) { return c.id === k; }) || {}).maxPoints;
      if (v != null) v = Math.max(0, Math.min(max, Math.round(v))); // never above maxPoints
      Muq.update(function (d) {
        var s = d.scores.find(function (s) { return s.judgeId === j && s.groupId === g && s.criterionId === k; });
        var now = new Date().toISOString();
        if (v == null) { if (s) d.scores.splice(d.scores.indexOf(s), 1); }
        else if (s) { s.value = v; s.updatedAt = now; }
        else d.scores.push({ competitionId: cid, judgeId: j, groupId: g, criterionId: k, value: v, updatedAt: now });
      });
    },
    groupTotal: function (cid, j, g) {
      var ks = Muq.criteria(cid), t = 0, f = 0;
      ks.forEach(function (k) { var v = Muq.score(j, g, k.id); if (v != null) { t += v; f++; } });
      return { total: t, filled: f, count: ks.length, complete: ks.length > 0 && f === ks.length, started: f > 0 };
    },
    judgeGroups: function (cid, a) {
      var ex = (a && a.excludedGroupIds) || [];
      return Muq.groups(cid).filter(function (g) { return ex.indexOf(g.id) < 0; });
    },
    progress: function (cid, judgeId) {
      var a = Muq.assignments(cid).find(function (x) { return x.judgeId === judgeId; });
      var rows = Muq.judgeGroups(cid, a).map(function (g) { return Object.assign({ group: g }, Muq.groupTotal(cid, judgeId, g.id)); });
      var done = rows.filter(function (r) { return r.complete; }).length;
      return { a: a, rows: rows, done: done, total: rows.length,
        status: rows.length && done === rows.length ? 'done' : rows.some(function (r) { return r.started; }) ? 'partial' : 'none' };
    },
    compProgress: function (cid) {
      var done = 0, total = 0;
      Muq.assignments(cid).forEach(function (a) { var p = Muq.progress(cid, a.judgeId); done += p.done; total += p.total; });
      return { done: done, total: total };
    },

    /* result = mean of complete judge totals; rank on 2dp; ties share rank (1,1,3) */
    results: function (cid) {
      var ks = Muq.criteria(cid), as = Muq.assignments(cid);
      var rows = Muq.groups(cid).map(function (g) {
        var per = {};
        as.forEach(function (a) {
          if ((a.excludedGroupIds || []).indexOf(g.id) >= 0) return;
          var t = Muq.groupTotal(cid, a.judgeId, g.id);
          if (t.complete) per[a.judgeId] = t.total;
        });
        var js = Object.keys(per), vals = js.map(function (j) { return per[j]; });
        var avg = vals.length ? vals.reduce(function (x, y) { return x + y; }, 0) / vals.length : null;
        var crit = {};
        ks.forEach(function (k) {
          crit[k.id] = js.length ? js.reduce(function (s, j) { return s + Muq.score(j, g.id, k.id); }, 0) / js.length : null;
        });
        return { group: g, avg: avg, per: per, crit: crit, n: vals.length };
      });
      var scored = rows.filter(function (r) { return r.avg != null; }).sort(function (a, b) { return b.avg - a.avg; });
      scored.forEach(function (r) {
        var key = r2(r.avg);
        r.rank = 1 + scored.filter(function (o) { return r2(o.avg) > key; }).length;
        r.tied = scored.filter(function (o) { return r2(o.avg) === key; }).length > 1;
      });
      var missing = as.map(function (a) {
        var gs = Muq.judgeGroups(cid, a).filter(function (g) { return !Muq.groupTotal(cid, a.judgeId, g.id).complete; });
        return { judge: Muq.judge(a.judgeId), groups: gs, all: gs.length === Muq.judgeGroups(cid, a).length };
      }).filter(function (m) { return m.groups.length; });
      return { rows: scored, unscored: rows.filter(function (r) { return r.avg == null; }), missing: missing,
        max: Muq.maxTotal(cid), criteria: ks, assignments: as };
    },

    /* formatting */
    fmt: function (n) { return n == null ? '—' : (Math.round(n * 10) / 10).toFixed(1); },
    date: function (iso) { var d = new Date(iso); return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); },
    joinAr: function (arr) { return arr.length <= 1 ? (arr[0] || '') : arr.slice(0, -1).join('، ') + ' و' + arr[arr.length - 1]; },
    rankWord: function (n) { return ['', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر'][n] || String(n); },
    newToken: function () { var c = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = ''; for (var i = 0; i < 10; i++) s += c[Math.floor(Math.random() * c.length)]; return s; },

    /* routing — #screen=judge-score&theme=dark&... */
    params: function () {
      var p = {};
      (location.hash.slice(1) || '').split('&').forEach(function (kv) {
        if (!kv) return; var i = kv.indexOf('=');
        p[decodeURIComponent(i < 0 ? kv : kv.slice(0, i))] = i < 0 ? '' : decodeURIComponent(kv.slice(i + 1));
      });
      return p;
    },
    href: function (screen, extra) {
      var cur = Muq.params(), p = { screen: screen };
      Object.keys(extra || {}).forEach(function (k) { if (k !== 'screen') p[k] = extra[k]; });
      ['theme', 'device'].forEach(function (k) { if (cur[k] && p[k] === undefined) p[k] = cur[k]; });
      return '#' + Object.keys(p).filter(function (k) { return p[k] != null && p[k] !== ''; })
        .map(function (k) { return k + '=' + encodeURIComponent(p[k]); }).join('&');
    },
    go: function (screen, extra) { location.hash = Muq.href(screen, extra).slice(1); },
    judgeUrl: function (token) { return location.href.split('#')[0] + '#screen=judge-home&t=' + token; },
    waLink: function (name, comp, token) {
      var msg = 'هلا ' + name + ' 👋\nأنت محكّم في «' + comp.title + '».\nافتح الرابط وقيّم من جوالك، كل درجة تنحفظ لحالها:\n' + Muq.judgeUrl(token);
      return 'https://wa.me/?text=' + encodeURIComponent(msg);
    },
    downloadCSV: function (cid) {
      var comp = Muq.comp(cid), R = Muq.results(cid);
      var head = ['المركز', 'المجموعة', 'المتوسط'].concat(R.criteria.map(function (k) { return k.name; }))
        .concat(R.assignments.map(function (a) { return Muq.judge(a.judgeId).name; }));
      var lines = [head].concat(R.rows.concat(R.unscored).map(function (r) {
        return [r.rank || '', r.group.name, Muq.fmt(r.avg)].concat(R.criteria.map(function (k) { return Muq.fmt(r.crit[k.id]); }))
          .concat(R.assignments.map(function (a) { return r.per[a.judgeId] != null ? r.per[a.judgeId] : ''; }));
      }));
      var csv = '\ufeff' + lines.map(function (l) { return l.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      a.download = comp.title + '.csv'; a.click();
    },
    /* Mount helper for DCs: waits for data, re-renders on store + hash change */
    attach: function (cmp) {
      var onHash = function () { cmp.forceUpdate(); };
      window.addEventListener('hashchange', onHash);
      var unsub = null;
      Muq.load().then(function () { unsub = Muq.subscribe(function () { cmp.forceUpdate(); }); cmp.setState({ ready: true }); });
      return function () { window.removeEventListener('hashchange', onHash); unsub && unsub(); };
    }
  };

  window.addEventListener('storage', function (e) {
    if (e.key !== KEY || !e.newValue) return;
    try { db = JSON.parse(e.newValue); notify(); } catch (err) {}
  });
  window.Muq = Muq;
})();
