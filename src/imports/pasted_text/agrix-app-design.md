Design and build a functional mobile application prototype called “AgriX”, a farmer-friendly agricultural marketplace, advisory, AI assistance, and farmer-to-farmer cooperative platform.

I will upload:

The AgriX logo
Reference images/screenshots of my previous UI
Additional reference images for the desired visual style

Use the uploaded logo and reference images as the primary visual references. Do not replace the logo with a generated alternative. Preserve the visual identity, color palette, styling, and overall feel of the previous frontend wherever appropriate, but redesign the experience specifically for a modern mobile application.

The app should feel like a combination of Swiggy + OLX + a simple farmer-support app: highly visual, card-based, searchable, easy to navigate, and extremely simple for farmers with limited digital literacy.

1. CORE DESIGN PRINCIPLE

The entire application should be:

Mobile-first
Simple and uncluttered
Modern but familiar
Farmer-friendly
Visually similar in usability to apps such as Swiggy and OLX
Card-based wherever appropriate
Easy to operate with one hand
Large enough touch targets
Clear icons with short labels
Minimal text wherever possible
High contrast
Clean typography
Not overly decorative
No unnecessary screens or complicated menus
Information should be presented in short bullet points, cards, tags, and concise sections rather than large paragraphs.

Maintain the color scheme of the previous frontend/reference screenshots as much as possible.

Do not redesign the brand colors unnecessarily.

The final UI should feel like a real production mobile app, not a desktop website squeezed onto a phone.

2. APP OPENING / SPLASH SCREEN

When the app is opened:

Display the AgriX logo that I upload prominently in the center.

Under the logo, optionally show a short tagline such as:

“Connect • Grow • Trade • Sustain”

Keep the splash screen minimal.

Use a short, smooth transition into the language-selection screen.

3. LANGUAGE SELECTION

After the splash screen, show a dedicated language-selection screen.

This screen should have a unique, visually appealing way of selecting languages.

The language names themselves MUST be displayed in their respective native scripts.

For example:

മലയാളം
हिन्दी
தமிழ்
తెలుగు
ਪੰਜਾਬੀ
English

Add other major Indian languages if appropriate.

Primary/default language: Malayalam.

Malayalam should be selected by default or visually emphasized as the primary language.

Critical language behavior:

Once the user selects a language:

Every subsequent screen, button, label, notification, menu, form, card, chatbot interface, voice-assistant response, and navigation element must be displayed ONLY in the selected language.

Do NOT show English translations underneath.

Do NOT display multiple languages simultaneously.

The selected language must persist throughout the entire app.

Provide a language-change option later inside Profile/Settings.

4. LOGIN / REGISTER SCREEN

After selecting the language, take the user to the Login/Register entry screen.

Keep the basic visual concept from the previous UI, but adapt it into a mobile layout.

Provide two prominent options:

Login
Register

Use large, recognizable icons and simple labels.

5. REGISTRATION — MANDATORY FIELD VALIDATION

Create a simple multi-step registration flow rather than putting everything on one crowded screen.

The app MUST NOT allow the user to continue to the next registration step if any mandatory field is empty or invalid.

Clearly mark mandatory fields with *.

Optional fields must be explicitly marked as Optional.

Do not make the user guess which fields are required.

Mandatory information

The following information must be required before registration can proceed:

Full Name
Valid Indian Phone Number
Complete Address
Profession / Occupation
Profession-specific information
Products they have / sell, where applicable
Products they need / buy, where applicable
Government ID verification, if required by the application's verification flow
Optional information
Email address

The email field may be skipped, but if the user enters an email address, it MUST be validated before continuing.

6. NAME VALIDATION

The Name field must:

Be mandatory
Not accept an empty value
Not accept only spaces
Remove accidental leading/trailing spaces
Require a reasonable minimum number of characters
Allow normal Indian names
Allow spaces between multiple names
Avoid unnecessarily restrictive rules that would reject legitimate Indian names

If the user attempts to continue without entering a name, display a clear message in the selected language.

Example meaning:

“Please enter your name to continue.”

Do not allow the registration flow to continue.

7. PHONE NUMBER — INDIAN FORMAT

The phone number is mandatory.

Follow standard Indian mobile-number conventions.

Requirements:

Accept Indian mobile numbers in appropriate formats.
Prefer a 10-digit Indian mobile number after selecting India.
Support the +91 country code.
Do not allow clearly invalid lengths.
Do not allow letters.
Do not allow random special characters.
Automatically handle spaces/hyphens appropriately if the user enters them.
Prevent obviously invalid numbers from being submitted.
Clearly indicate that the country code is India / +91.
Use OTP verification.

Example UI:

+91 | 10-digit mobile number

The app should validate the number before sending the OTP.

Do not send an OTP to an obviously invalid number.

After OTP verification, mark the phone number as:

Verified

Do not allow the user to proceed as a registered user until the required OTP verification is successfully completed.

8. EMAIL VALIDATION

Email is optional, but if entered it MUST be correctly formatted.

Use standard email-format validation.

Accept legitimate formats such as:

name@example.com

Reject clearly invalid entries such as:

Missing @
Missing domain
Missing domain extension where required
Spaces inside the address
Multiple @ characters
Invalid characters
Incomplete addresses

Examples of invalid entries:

abc
abc@
abc@gmail
abc @gmail.com
abc@@gmail.com

If the user leaves the email field completely empty, allow them to continue because email is optional.

If they enter an email, do not allow the registration step to continue until the format is valid.

Error messages must be shown in the currently selected language only.

9. ADDRESS VALIDATION

Address is mandatory.

The address should be collected in a structured Indian-friendly format:

House / Building Name or Number — Mandatory
Street / Locality / Area — Mandatory
Landmark — Optional
City / Town / Village — Mandatory
District — Mandatory where applicable
State / Province — Mandatory
PIN Code — Mandatory
Country — Mandatory

Default country:

India

PIN code validation

Follow Indian PIN-code conventions.

The PIN code should:

Contain exactly 6 digits
Accept only numeric characters
Reject invalid lengths
Reject alphabetic characters
Be associated with the selected Indian location where real location services are available

Do not allow the user to continue with an incomplete or clearly invalid PIN code.

10. PROFESSION / OCCUPATION VALIDATION

Profession/occupation is mandatory.

Ask:

“What best describes you?”

Options:

Farmer
Agro-processing Unit
Livestock / Allied Sector
Rural Entrepreneur / SHG
Energy & Sustainability Startup

The user MUST select one.

If nothing is selected:

Do not allow the user to continue.

Show a clear validation message in the selected language.

11. PROFESSION-SPECIFIC REQUIRED INFORMATION

After selecting the profession, show the appropriate next step.

The required information should dynamically change according to the profession.

For example:

Farmer

Require:

Type of farmer
Relevant crop/product information
What they have / can sell
What they need / want to buy
Agro-processing Unit

Ask relevant processing-related information.

Livestock / Allied Sector

Ask relevant livestock/allied-sector information.

Rural Entrepreneur / SHG

Ask relevant business/product information.

Energy & Sustainability Startup

Ask relevant sustainability/energy-related information.

Do not allow the user to continue without completing the mandatory profession-specific information.

12. REQUIRED FIELD BEHAVIOR

Every important form must use strong validation.

Rules:

Mandatory fields cannot be empty.
Fields containing only spaces count as empty.
Invalid values cannot be submitted.
Invalid phone numbers cannot proceed.
Invalid email addresses cannot proceed when email is provided.
Invalid PIN codes cannot proceed.
Profession must be selected.
Profession-specific required information must be completed.
OTP verification must be completed where required.
Government ID verification/upload must be completed where required.
Validation must happen both while entering information and when pressing Continue/Submit.
Clearly highlight the exact field that needs correction.
Never erase the user's other correctly entered information because one field is invalid.
Preserve entered data when moving between registration steps.
Show concise error messages in the selected language.
13. VALIDATION UX

Do not make validation frustrating.

Use:

Inline validation
Clear error icons
Helpful messages
Green/verified states when appropriate
Disabled Continue button when essential information is missing
Clear indication of which fields remain incomplete

At the bottom of each registration screen show progress such as:

Step 1 of 4

or a simple progress indicator.

The user should always understand:

What information is required
What has already been completed
What remains
14. GOVERNMENT ID

Allow the user to add:

Aadhaar Card
Other Government ID

Provide:

Take Photo / Upload Document

Do not unnecessarily expose or publicly display the complete government ID number.

Use privacy-friendly UI and masking.

Show a clear verification state:

Not submitted
Submitted
Verified
Verification required

If government-ID verification is configured as mandatory for the particular account flow, the user must complete it before final registration.

15. FARMER PROFILE INFORMATION

If the user selects Farmer, ask:

Type of farmer

Provide categories such as:

Crop farmer
Vegetable farmer
Fruit farmer
Paddy farmer
Plantation farmer
Organic farmer
Mixed farmer
Other

Then ask:

What do you have?

Allow the farmer to select products/byproducts they currently have or can sell.

What do you want?

Allow the farmer to select products/byproducts they need or want to purchase.

Use a searchable dropdown/multi-select interface.

Product options should include:

Crop residues (straw, stalks, chaff)
Rice husk
Sugarcane bagasse
Dry leaves and plant waste
Weed biomass
Banana stem and leaves
Coconut husk
Coconut shell
Coir dust / coco peat
Rubber leaves
Coffee pulp
Tea waste
Spoiled fodder / leftover feed
Cow dung
Cow urine
Goat and sheep droppings
Pig manure
Poultry litter
Egg shells
Broken eggs
Feathers
Animal hair / wool waste
Old bedding straw
Fish waste
Pond sludge
Dead fish — disease-free
Treated livestock wastewater
Biogas slurry
Compost / vermicompost surplus
Wood shavings / sawdust

Allow users to search products rather than scrolling through an extremely long list.

16. PERSONALIZED MAIN HOME SCREEN

After registration/login, take the user to the main AgriX home screen.

The home screen should resemble a modern marketplace/application such as Swiggy or OLX.

TOP NAVIGATION
Top-left:

Profile icon.

Top-center:

Prominent AI Camera button.

Top-right:

AI Assistant icon.

17. AI CAMERA

When selected, open three AI camera functions:

1. Soil Scan

Allow the user to take a picture of soil.

Provide an estimated/indicative assessment related to:

Soil organic carbon
Soil condition
Possible soil characteristics
Recommended improvements

Clearly communicate that image-based results are estimates and laboratory testing is required for accurate soil analysis.

2. Product Identification

Allow the farmer to photograph an agricultural product/byproduct.

Display:

Product name
Possible uses
Potential buyers
Approximate market relevance
Processing opportunities
Related products
3. Crop Disease Detection

Allow the farmer to photograph a crop.

Display:

Likely issue
Visible symptoms
Suggested next steps
Preventive practices
When expert confirmation is recommended

Do not present uncertain AI results as guaranteed diagnoses.

18. AI ASSISTANCE

Top-right should contain an AI Assistant.

The assistant should help with:

Crop advisories
Products
Farmers
Cooperative connections
Government schemes
Weather
Soil
Market information
Product processing
Sustainable farming
Navigation

Support:

Text
Microphone
Camera
Image upload
File upload

All responses must follow the selected language.

19. RECOMMENDED PRODUCTS

Below the top AI panel, show:

Recommended for You

Two categories:

You can sell

Products/byproducts the system believes the user can sell.

You may need

Products the user might benefit from purchasing.

Recommendations should use:

Farmer type
Products they have
Products they need
Crop
Location
Market demand
Crop advisories

Use marketplace-style product cards.

20. SMART NOTIFICATION BAR

Display personalized notifications such as:

A nearby farmer is selling something the user needs.
Someone needs a byproduct the user has.
Demand for the user's product has increased.
A relevant scheme is available.
Weather conditions changed.
A cooperative match is available.

Allow tapping the notification to open the relevant result.

21. SEARCH / MARKETPLACE

Include a highly visible search bar.

Search for:

Farmers
Products
Byproducts
Agricultural materials
Requirements

Each result should show:

Farmer name
Available product
Quantity
Price/unit
Location
Distance
Contact option
AgriX Trust Score
22. TRUST / CONFIDENCE SCORE

Display:

AgriX Trust Score

Base the score on appropriate platform activity such as:

Previous successful transactions
Transaction completion rate
Buyer/seller feedback
Dispute history
Account verification
Listing consistency
Reliability
Cooperative interactions

Do not present the score as an absolute guarantee.

Allow the user to tap the score to understand its components.

23. NO SEARCH RESULT

If a farmer/product cannot be found:

Display a friendly message in the selected language meaning:

“We couldn't find this product right now. We'll notify you when someone lists it.”

Include:

Notify Me

24. COOPERATIVE CONNECTIONS

Create a dedicated Cooperative Connections section.

Purpose:

Connect farmers and agricultural participants so agricultural waste/byproducts can be exchanged instead of wasted.

Example:

Cattle waste → agricultural fertilizer
Paddy residues → livestock-related uses
Crop residues → processing/feed/other uses
Coconut waste → coir/cocopeat-related uses

Goal:

Minimum waste + maximum useful exchange + sustainable agriculture.

25. SMART COOPERATIVE MATCHING

Rank connections from best to worst.

Consider:

Geographic proximity
Product requirement
Quantity
Price
Farmer type
Crop compatibility
Previous successful transactions
Trust score
Product compatibility
Sustainability benefit
Overall match

Show:

Farmer
Product
Quantity
Price
Distance
Trust score
Match percentage
Connect/contact option
26. COOPERATIVE PRODUCT FILTER

At the top show horizontally scrollable product filters.

Include:

Products selected under “What do you want to buy?”
Products suggested by Crop Advisories
System-recommended products
All of these

Allow one or multiple selections.

Update results dynamically.

27. CROP ADVISORIES

Create a personalized Crop Advisories section.

Based on:

Farmer type
Crop
Products they have
Products they need
Location
Climate
Season

Show:

What can I do with what I have?
How can I process what I have?
What should I have / produce?

Use short bullet points and practical information.

Suggestions should automatically feed into:

Recommended Products
Cooperative Connections
Marketplace
Notifications
28. WEATHER & SOIL

Display:

Current weather
Temperature
Rain probability
Humidity
Wind
Forecast
Soil information
Recommended conditions
Estimated best growing period

Use reliable external data sources when real integrations are implemented.

29. LATEST AGRICULTURAL TRENDS

Show:

Products in higher demand
Locations with higher demand
Seasonal opportunities
Sustainable farming methods
Processing opportunities
Useful byproducts
Market trends

Keep cards concise and easy to scan.

30. MARKET PRICE PREDICTION

Display:

Current market information
Estimated selling price
Price range
Demand
Trend
Estimated best selling period

Clearly identify predictions as estimates.

31. GOVERNMENT SCHEMES

Show relevant schemes based on:

Location
Farmer type
Profession
Crop
Eligibility

Each card:

Scheme name
Description
Eligibility
Benefits
Important dates
Application information
Apply/View Details
32. AGRICULTURAL EVENTS

Show:

Farmer meetings
Agricultural exhibitions
Training programs
Workshops
Government events
Local agricultural events

Prioritize events based on location.

33. FARMER DASHBOARD

Create a simple dashboard containing:

Crop Advisories
Government Schemes
Recommended Conditions
Live Weather
Market Prices
Latest Trends
Cooperative Connections
My Products
My Requirements
My Transactions
Agricultural Events
34. PROFILE

Allow the farmer to:

View profile
Edit profile
Update products
Update requirements
Update farmer type
Update address
Manage Government ID
Change language
View Trust Score
View transactions
Logout

Profile changes should update recommendations and matching.

35. TRANSACTIONS

Show:

Product
Buyer/seller
Quantity
Price
Date
Status
Review/trust information

Successful transactions should contribute appropriately to reliability scoring.

36. FLOATING AI VOICE BUTTON

A floating microphone must remain accessible throughout the app.

When pressed, provide an Alexa-like assistant.

Commands can include:

“Go to previous screen.”
“Show government schemes.”
“Is anyone selling rice husk?”
“Find farmers near me who have cow dung.”
“Show my crop advisory.”
“Open weather.”
“Show my profile.”
“Find someone who needs the product I have.”

The assistant must understand the selected language.

It should perform app actions, not only answer questions.

37. AI CHATBOT

Create a dedicated chatbot.

Support:

Text
Voice
Camera
Image upload
File upload

Examples:

“I have this crop. What should I do?”

“I need rice husk.”

“Who nearby needs cow dung?”

“Is there a scheme for me?”

“Can I sell this?”

“What can I make from this waste?”

Personalize answers using available user information.

38. SMART ROUTE PLANNER

When a required product is selected:

Show practical nearby suppliers ranked by:

Match
Distance
Quantity
Price
Trust
Product compatibility

Display route/distance information where available.

39. NOTIFICATIONS

Support:

Required product availability
Someone needing user's byproduct
Price changes
Demand changes
Crop advisory updates
Weather alerts
Scheme deadlines
Events
Cooperative recommendations
Transaction updates

All notifications must use the selected language.

40. MOBILE NAVIGATION

Recommended bottom navigation:

Home | Marketplace | Cooperative | Dashboard | Profile

Floating AI microphone above the navigation.

Avoid excessive navigation levels.

Use predictable back navigation.

41. ACCESSIBILITY / FARMER-FRIENDLY DESIGN

Prioritize limited digital literacy.

Use:

Familiar icons
Short labels
Simple language
Visual cues
Large touch targets
Strong hierarchy
Minimal typing
Voice interaction
Camera interaction
Search
Guided forms

Whenever possible allow:

Tap • Speak • Scan • Select

instead of requiring typing.

42. LANGUAGE SYSTEM

Support at least:

Malayalam
Hindi
Tamil
Telugu
Punjabi
English

Allow additional Indian languages later.

Malayalam is the primary/default language.

When a language is selected, all UI and AI content must use ONLY that language.

43. DATA PERSONALIZATION

Registration data should flow throughout the app:

Profession + Farmer Type + Location + Products Have + Products Need

↓

Crop Advisories
Recommended Products
Cooperative Connections
Marketplace
Notifications
Weather/Soil
Market Information
Government Schemes
AI Assistant

The app must feel personalized rather than generic.

44. SECURITY & PRIVACY

Treat Government ID, phone number, address, and other personal information as sensitive.

Use privacy-friendly interfaces.

Mask sensitive government ID information where appropriate.

Do not publicly expose unnecessary personal information.

Only reveal contact information according to the application's intended privacy model.

45. FUNCTIONAL PROTOTYPE

Implement functional prototype behavior for:

Login
Registration
Required-field validation
Phone validation
Indian phone OTP
Email validation
Address validation
PIN validation
Government ID upload
Profession selection
Profession-specific forms
Product selection
Search
Marketplace
Language persistence
Profile editing
Dashboard
Crop Advisories
Cooperative matching
Product filtering
Trust Score
Notifications
AI camera UI
AI assistant
Voice assistant
Chatbot
Government schemes
Weather
Market prices
Events
Navigation

Where real APIs are unavailable, use realistic mock data and structure the app so real services can later be connected.

Do not label mock data as live data.

46. IMPORTANT REGISTRATION RULE

UNDER NO CIRCUMSTANCES SHOULD THE APP COMPLETE REGISTRATION OR MOVE PAST A REQUIRED REGISTRATION STEP WHEN CRITICAL INFORMATION IS MISSING OR INVALID.

At minimum, verify:

Name ✓
Phone ✓
Phone OTP ✓
Address ✓
PIN Code ✓
Profession ✓
Profession-specific information ✓

Email should only be validated when supplied because it is optional.

Government ID should follow the configured verification requirement.

The Continue/Submit button should either:

Remain disabled until essential requirements are satisfied, OR
Allow tapping but immediately display clear validation messages and prevent progression.

Never silently accept missing information.

47. CONNECTED ECOSYSTEM

Features must share data.

Example:

Paddy farmer registers
↓
Adds rice husk under “What I have”
↓
Crop Advisory explains possible uses
↓
AI suggests useful processing opportunities
↓
Suggestions appear in Recommended Products
↓
Suggestions become Cooperative Connection filters
↓
Nearby farmers needing rice husk appear
↓
Best connections are ranked
↓
Farmer receives notifications
↓
Transaction takes place
↓
Transaction history updates
↓
Trust/reliability score updates.

Similarly:

Farmer needs cow dung
↓
Nearby suppliers are identified
↓
Search can find them
↓
Cooperative Connections displays them
↓
AI assistant can answer who has cow dung
↓
Voice assistant can open the relevant supplier.

48. FINAL EXPERIENCE

The final experience should feel like:

Open AgriX → see AgriX logo → choose Malayalam → register/login → complete verified farmer profile → arrive at a personalized marketplace-style home screen → buy, sell, exchange, search, scan, ask AI, check weather, receive advisories, discover schemes, find nearby farmers, and communicate with the app through voice.

The application should feel like a real Indian mobile product, not a generic agricultural dashboard.

49. REFERENCE IMAGES & LOGO

I will upload:

Previous frontend screenshots
AgriX logo
Additional visual references if needed

Analyze these carefully.

Use the previous frontend as the visual foundation for the new application.

Do NOT simply copy the old desktop/web layout.

Instead:

Previous visual identity + previous useful functionality + new AgriX mobile marketplace vision = final app.

Prioritize the new mobile requirements whenever they conflict with the old website structure.

The final output should be a complete, coherent, navigable, mobile-first AgriX application prototype with functional interactions and strong Indian-form validation.