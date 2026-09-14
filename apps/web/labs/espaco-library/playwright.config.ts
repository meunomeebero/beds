import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';
const evidence = fileURLToPath(new URL('./evidence/', import.meta.url));
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5283';
export default defineConfig({
 testDir:'.',testMatch:'*.spec.ts',fullyParallel:true,forbidOnly:true,retries:0,workers:2,timeout:45000,
 outputDir:evidence+'test-results',
 reporter:[['list'],['json',{outputFile:evidence+'results.json'}]],
 use:{baseURL,browserName:'chromium',locale:'en-US',trace:'retain-on-failure',screenshot:'only-on-failure',actionTimeout:8000},
 projects:[
 {name:'desktop',use:{viewport:{width:1440,height:1000},deviceScaleFactor:1}},
 {name:'mobile',use:{viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true}},
 ],
});
