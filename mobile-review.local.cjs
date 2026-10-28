const { chromium } = require('playwright');
(async () => {
 const browser = await chromium.launch();
 const page = await browser.newPage({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:2});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4174');
 await page.locator('.scroll-cue').click();
 await page.waitForTimeout(2100);
 await page.screenshot({path:'test-results/mobile-train-smooth.png'});
 await page.waitForTimeout(6500);
 await page.locator('.board-viewport').evaluate(el=>el.scrollTop=360);
 await page.screenshot({path:'test-results/mobile-family-smooth.png'});
 await page.waitForTimeout(19000);
 await page.locator('.board-viewport').evaluate(el=>el.scrollTop=el.scrollHeight);
 await page.screenshot({path:'test-results/mobile-finish-smooth.png'});
 console.log(JSON.stringify(await page.evaluate(()=>({state:document.querySelector('.journey-story').dataset.state,kind:document.querySelector('.story-actor').dataset.kind,overflow:document.documentElement.scrollWidth>innerWidth,events:document.querySelectorAll('.story-event.revealed').length}))),errors);
 await browser.close();
})();
