"""يصوّر حالات النموذج للمقارنة البصرية.
الاستخدام:
  npx serve prototype -l 8765 &
  npm i react@18.3.1 react-dom@18.3.1 @babel/standalone@7.29.0   (مرة واحدة، لتشغيله بدون شبكة)
  python3 tools/screenshots.py shots/
"""
import sys, os, asyncio
from playwright.async_api import async_playwright
BASE = os.environ.get("PROTO_URL", "http://localhost:8765/")
NM = os.environ.get("NODE_MODULES", "node_modules/")
LOCAL = {"react.production.min.js": NM + "react/umd/react.production.min.js",
         "react-dom.production.min.js": NM + "react-dom/umd/react-dom.production.min.js",
         "babel.min.js": NM + "@babel/standalone/babel.min.js"}
SHOTS = [
 ("F_judge_score", "JudgeScore.dc.html#screen=judge-score&t=Rt4vW8zN1c&g=c1g1&input=stepper", 390, 844),
 ("F_offline", "JudgeScore.dc.html#screen=judge-score&t=Rt4vW8zN1c&g=c1g1&input=stepper&net=offline", 390, 844),
 ("E_judge_home", "JudgeHome.dc.html#screen=judge-home&t=Rt4vW8zN1c", 390, 844),
 ("E_expired", "JudgeHome.dc.html#screen=judge-home&t=expired00", 390, 844),
 ("D_admin_phone", "AdminDashboard.dc.html#screen=admin&comp=c1", 390, 844),
 ("D_admin_laptop", "AdminDashboard.dc.html#screen=admin&comp=c1&device=laptop", 1440, 900),
 ("C_create", "CreateCompetition.dc.html#screen=create", 390, 844),
 ("C_edit_frozen", "CreateCompetition.dc.html#screen=create&edit=c1", 390, 844),
 ("B_competitions", "Competitions.dc.html#screen=competitions", 390, 844),
 ("A_login", "ClubLogin.dc.html#screen=login", 390, 844),
 ("G_results", "AdminResults.dc.html#screen=results&comp=c1", 1440, 900),
 ("G_criteria", "AdminResults.dc.html#screen=results&comp=c1&tab=criteria", 1440, 900),
 ("G_judges", "AdminResults.dc.html#screen=results&comp=c1&tab=judges", 1440, 900),
 ("H_reveal_start", "RevealStage.dc.html#screen=reveal&comp=c2&step=0", 1920, 1080),
 ("H_reveal_end", "RevealStage.dc.html#screen=reveal&comp=c2&step=end", 1920, 1080),
 ("I_public", "PublicResults.dc.html#screen=public&comp=c2", 390, 844),
 ("J_share_card", "ShareCard.dc.html#screen=share-card&comp=c2", 1080, 1350),
]
async def main(out):
    os.makedirs(out, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name, url, w, h in SHOTS:
            pg = await b.new_page(viewport={"width": w, "height": h})
            async def route(r):
                f = r.request.url.rsplit("/", 1)[-1]
                if f in LOCAL and os.path.exists(LOCAL[f]):
                    await r.fulfill(path=LOCAL[f], content_type="application/javascript")
                else:
                    await r.continue_()
            await pg.route("https://unpkg.com/**", route)
            errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(BASE + url); await pg.wait_for_timeout(1500)
            await pg.screenshot(path=f"{out}/{name}.png")
            print(name, "ok" if not errs else "ERR " + errs[0][:200])
            await pg.close()
        await b.close()
asyncio.run(main(sys.argv[1] if len(sys.argv) > 1 else "shots"))
