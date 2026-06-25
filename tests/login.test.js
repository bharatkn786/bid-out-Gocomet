import { test, expect } from '@playwright/test';



function format(date){
 return date.toISOString().slice(0, 16);
}
test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByLabel('Email').fill('bharatkn786@gmail.com');
  await page.getByLabel('Password').fill('123456789');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByLabel('Enter 6-digit OTP').fill('123456');
  await page.getByRole('button',{name:'Verify OTP'}).click();

  await expect(page).toHaveURL('http://localhost:5173/');

 const cards = page
    .getByTestId('live-auction-grid')
    .locator(':scope > *');

//     :scope means the current element (live-auction-grid).
// > means direct children only.
// * means all child elements.
const countBefore = await cards.count();

//   3. getByRole('link', { name: 'Request Quotation' })
// This is called a locator.It tells Playwright:
// "Find an HTML element whose accessibility role is link and whose visible text is Request Quotation."

  await page.getByRole('link', { name: 'Request Quotation' }).click();


  // getByText() finds visible text, not an input.
  // we can also do with location but for it we need to check the variable stored 
  await page.getByPlaceholder('e.g. Mumbai to Delhi Freight Q2').fill('Mumbai to Delhi Freight');
  await page.getByPlaceholder('Provide additional details about the load, vehicle requirements, etc.').fill('shifting goods');

  
const now = new Date();
  // Open the date picker
await page
  .locator('input[name="bid_start_at"]')
  .fill(format(now));


// ❌ Invalid Bid Close (1 hour before start)
const close = new Date(now);
close.setHours(close.getHours() - 1);





await page.locator('input[name="bid_close_at"]').fill(format(close));


const forced = new Date(close);
forced.setMinutes(forced.getMinutes() + 20);
await page.locator('input[name="forced_close_at"]').fill(format(forced));

const pickup=new Date();
pickup.setDate(pickup.getDate()+15);
await page.locator('input[name="pickup_date"]').fill(format(pickup));


await page.locator('input[name="trigger_window_minutes"]').fill('10');
await page.locator('input[name="extension_duration_minutes"]').fill('5');

await page.locator('select[name="trigger_type"]').selectOption('bid_received');


// Submit invalid data
    await page.getByRole('button', {name: 'Create Request for Quotation'}).click();
    // for invalid 
    await expect(
  page.getByText('Bid close time must be later than bid start time')
).toBeVisible();



// ✅ Correct the Bid Close time
close.setHours(now.getHours() + 12);
await page.locator('input[name="bid_close_at"]').fill(format(close));



// Correct Forced Close
forced.setTime(close.getTime());
forced.setMinutes(forced.getMinutes() + 20);

await page.locator('input[name="forced_close_at"]').fill(format(forced));



const responsePromise = page.waitForResponse(response =>
  response.url().includes('/rfq/create') &&
  response.request().method() === 'POST'
);
// now submit again
 await page.getByRole('button', {name: 'Create Request for Quotation'}).click();


// Wait for the API response
const response = await responsePromise;

// Verify backend response
expect(response.status()).toBe(200);


const request = response.request();

console.log(request.method());   // POST
console.log(request.url());      // API URL
console.log(request.postData()); // JSON payload
// Verify redirect to home page
await expect(page).toHaveURL('http://localhost:5173/');
});


