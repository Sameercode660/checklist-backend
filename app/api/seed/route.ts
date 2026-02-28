// app/api/seed/route.ts
// ONE-TIME USE — call this once to seed the checklist templates
// DELETE or protect this route after seeding in production

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SECTIONS = [
  { title: 'Critical Food Safety',     codes: ['FS1','FS2','FS3','FS4','FS5','FS6','FS7','FS8'] },
  { title: 'Hygiene & Sanitation',     codes: ['FS9','FS10','FS11','FS12','FS13'] },
  { title: 'Contamination Prevention', codes: ['FS14','FS15','FS16','FS17','FS18','FS19','FS20','FS21','FS22'] },
  { title: 'Storage',                  codes: ['FS23','FS24','FS25','FS26'] },
  { title: 'Cooking',                  codes: ['FS27'] },
  { title: 'General',                  codes: ['FS28','FS29','FS30','FS31','FS32','FS33'] },
]

const codeToSection: Record<string, string> = {}
SECTIONS.forEach(s => s.codes.forEach(c => (codeToSection[c] = s.title)))

const CHECKLIST_DATA = [
  { code:'FS1',  isCritical:true,  points:0, title:'Pest Infestation', description:'Restaurant is free of infestation and/or signs of active pest (animal/insect) infestation in the restaurant building, adjoining corral and any area within 10 feet (3m) of the building.', subItems:['Inside the restaurant has visible infestation','Inside the restaurant shows signs of active infestation','Outside the restaurant has visible infestation','Outside the restaurant shows signs of active infestation','Other'] },
  { code:'FS2',  isCritical:true,  points:0, title:'Beef Patties Temperature', description:'The internal temperatures of beef patties after cooking are at or above 155°F (69°C).', subItems:[] },
  { code:'FS3',  isCritical:true,  points:0, title:'Raw Chicken Temperature', description:'The internal temperatures of raw chicken products after cooking are at or above 165°F (74°C).', subItems:[] },
  { code:'FS4',  isCritical:true,  points:0, title:'Filet-O-Fish Temperature', description:'The internal temperatures of Filet-O-Fish portions after cooking are at or above 160°F (71°C).', subItems:[] },
  { code:'FS5',  isCritical:true,  points:0, title:'Breakfast Sausage Temperature', description:'The internal temperatures of breakfast sausage after cooking are at or above 155°F (69°C) for sausage made from raw beef or pork and 165°F (74°C) for sausage made from raw chicken.', subItems:[] },
  { code:'FS6',  isCritical:true,  points:0, title:'McMuffin Egg Temperature', description:'Cooked McMuffin raw round eggs have gelled yolks (are not runny) and internal temperatures are at or above 155°F (69°C).', subItems:[] },
  { code:'FS7',  isCritical:true,  points:0, title:'Food Safety Manager Certification', description:'The on duty manager (or staff assigned to complete the checklist), is certified (BSM) in food safety and can demonstrate they have been trained on properly completing the Food Safety Daily Checklist including the ability to take corrective action.', subItems:['No appropriately food safety trained manager present during the shift','Manager does not know how to complete Food Safety Daily Checklist','Manager does not know how to correctly meet Critical questions requirements','Manager does not know how to perform corrective actions','Other (List areas of manager lack of knowledge)'] },
  { code:'FS8',  isCritical:true,  points:0, title:'Critical Product Shelf Lives', description:'Critical to food safety products (shredded iceberg lettuce, pasteurized shake/sundae, chilled ready to eat meats and those labelled with "Use By") shelf-lives are being adhered to.', subItems:['Product not labelled','Product past shelf life','Other'] },
  { code:'FS9',  isCritical:false, points:5, title:'Handwashing Sinks', description:'There is running water and required supplies at all handwashing sinks. Handwashing sinks are easily accessed by employees and only used for hand washing, not preparing food or storing equipment.', subItems:['No running water','Supplies not available (soap / anti-microbial soap)','Soap dispenser not functioning properly','Handwashing sink knobs/automatic tap not working','No paper towel/working hand dryer','Handwashing sink used for other purposes','Handwashing sink/taps not reachable, obstructed or accessible','Other'] },
  { code:'FS10', isCritical:false, points:5, title:'Handwashing Procedure', description:'Hands are properly washed following hand washing procedures. A system is in place to ensure hourly and activity based hand washing by all employees.', subItems:['Hands not washed according to set procedure','Hands not washed on hourly basis','Hand washing clock/timer not working/not in use','Hand washing activity not monitored','Hand washing does not follow activity based procedure','Hands not washed after using restroom/taking a break','Hands not washed after handling raw products','Hands not washed after tasks (i.e. handling waste, touching face, hair, picking items off floor, etc.)','Other'] },
  { code:'FS11', isCritical:false, points:5, title:'Sanitized Towel/Cloth Buckets', description:'Sanitizer bucket contains a sufficient number of towels. Sanitizer solution is at the correct concentration, checked with the appropriate test strip or other method.', subItems:['Fresh bucket with sanitized towels not prepared','Buckets not labeled correctly','Not enough towels in fresh bucket','Used towels mixed with fresh towels','Bucket is soiled / water is not clean','Sanitizer level is not at correct concentration','Test strips not available or damaged / expired / not in usable condition','Fresh sanitizer is not added whenever clean cloths are added','Clean and/or dirty buckets not placed in convenient and accessible location','Other'] },
  { code:'FS12', isCritical:false, points:5, title:'Sanitizer-Soaked Towels/Cloths', description:'Cloths used at food or beverage preparation areas are not sitting out on kitchen surfaces longer than 1 hour (in-line with hand washing timing or more frequent).', subItems:['Towels/grill cloths left unattended at food, beverage, prep, or grill area','Disposable "Single Use" towel procedure not followed (if implemented)','Not able to distinguish between cloths for different location use (e.g. restrooms/kitchen)','Other'] },
  { code:'FS13', isCritical:false, points:3, title:'Utensils Sanitizing', description:'All UHC trays, grill utensils, prep table utensils and utensil holders cleaned (no build up) and sanitized at least every 4 hours as per globally approved procedure.', subItems:['In use UHC trays, utensils and utensil holders are not clean','Items are not being cleaned and sanitized every 4 hours','Back sink not dispensing hot and cold water','Back sink dispenser/warewasher not operating properly','Back sink dispenser not dispensing correct sanitizer','Back sink dispenser not dispensing correct soap','Test strips not available or damaged/expired/not in usable condition','Restaurant management team not able to show that items are cleaned and sanitized every 4 hours','Other'] },
  { code:'FS14', isCritical:false, points:3, title:'State of Cleanliness', description:'The restaurant (all areas) in a good state of cleanliness. In all areas the floors/walls/ceiling and equipment do not have dust/dirt/food build up. There should not be a pool of standing water in the restaurant.', subItems:['Build up of dirt/grease on floors/walls/ceiling (e.g. build up of food debris under equipment)','Build up of dirt/grease on equipment','Standing water','Restrooms and facilities not cleaned regularly (minimum every 2 hours)','Restrooms and facilities not stocked','Waste storage room not clean and/or has a foul odor','Other'] },
  { code:'FS15', isCritical:false, points:3, title:'State of Repair', description:'The building & equipment is functioning properly and in a good state of repair (not cracked or damaged). The freezers should not have an excess build-up of ice that would prohibit the unit to function properly.', subItems:['Floors/drains/walls/ceiling not in good repair (e.g. broken/missing tiles)','Broken equipment/utensils/trays/etc. in use','Grease traps in use not functioning properly','Ice build-up in freezer','Other'] },
  { code:'FS16', isCritical:false, points:3, title:'Water and Ice', description:'Appropriate measures taken to protect water and ice from foreign material, chemicals and/or microbial contamination. Water filters in date and ice machines free from mold.', subItems:['Water filter not in date','Water filters bypassed','Ice bucket and scoops not clean','Ice bucket and scoops not in good repair','Water / ice not protected from possible contamination','Ice bin has visible mold','Other'] },
  { code:'FS17', isCritical:false, points:3, title:'Food Product Storage', description:'Opened packages of food in storage (including dry storage, refrigerators and freezers) covered/wrapped, labeled, off the floor and away from walls. Product stored according to proper procedures.', subItems:['Product not covered','Product not labelled','Product not off the floor','Product not away from the wall','Product not stored according to procedure (e.g. raw above ready to eat)','Shake/sundae reservoir lid not in place','All non-essential equipment, stationery and other items are removed from food preparation areas','There is no plan for glass/porcelain/crockery breakage clearance','Other'] },
  { code:'FS18', isCritical:false, points:5, title:'Raw Food Product Handling', description:'Blue or colored disposable glove procedures used to prevent cross-contamination when handling all raw meat or poultry products (including shell eggs) at the grill station. Dedicated utensils used for raw products.', subItems:['Blue or colored disposable glove procedures when handling all raw meat/poultry products is not followed','Blue gloves used for purpose other than raw beef, poultry or eggs (approval needed for exception)','Gloves not replaced when damaged/contaminated','Gloves not changed and hands not washed if become contaminated','Bare hands used with raw product at grill','Local glove procedure for food preparation not followed','Yellow hutzler spatula/egg yolk breaking tool not available','Yellow hutzler spatula/egg yolk breaking tool used for items other than raw eggs','Utensils other than yellow hutzler spatula/egg breaking tool used to break raw egg yolks','Other'] },
  { code:'FS19', isCritical:false, points:5, title:'Personal Hygiene Procedures', description:'Disposable gloves and other personal hygiene procedures followed.', subItems:['Hands not washed prior to putting on fresh gloves for preparing salads','Gloves not replaced when damaged/contaminated','Gloves not discarded when removed or being reused','Gloves not changed and hands not washed if become contaminated','Gloves not worn or hands not cleaned and disinfected before adding ice / shake or sundae mix','Clear gloves are used for handling raw products','Blue gloves used for purpose other than raw beef, poultry or eggs','Aprons/hairbeard cover not used properly to prevent product contamination','Aprons/hairbeard cover not removed before use of toilet','Uniforms not clean','Uniforms not in good repair','Minimum jewelry standard not followed','False and/or dirty fingernails','Other'] },
  { code:'FS20', isCritical:false, points:3, title:'Chemical Management', description:'All chemicals are clearly labelled and stored away from food and packaging.', subItems:['Chemical spray bottles / containers stored in the kitchen near food or open packages','Chemicals are stored in dry storage near to food and packaging','Chemicals stored in food containers','Chemicals not clearly labelled','Up to date MSDS sheets not available','Other'] },
  { code:'FS21', isCritical:false, points:3, title:'Pest Management', description:'Pest management program is in place and working effectively. Restaurant is pest proofed to prevent entry of pests (e.g. gaps under doors are sealed. Drive-thru window closed when not in use).', subItems:['Pest management program is not in place','Pest management program is not working effectively','Restaurant is not pest proofed','Drive-thru window not closed when not in use','Pest management equipment is not in good repair','Pest management equipment is not fixed in position','Pest management chemical safety information is not available','Pest management chemicals (poisons) not secure within equipment','Most recent pest control report recommendations not corrected','Other'] },
  { code:'FS22', isCritical:false, points:1, title:'Non-Food / Biohazard Spill Procedures', description:'Non-food / biohazard spill procedures are in place.', subItems:['One or more of the non-food / biohazard spill kit tools are not available','Non-food / biohazard spill kit not complete or damaged','Staff not trained in the use of the non-food / biohazard spill kit','Procedure not followed','Other'] },
  { code:'FS23', isCritical:false, points:5, title:'Frozen Products', description:'Walk-in freezer and any other primary storage freezers keeping products at 0°F (-18°C) or below. Secondary storage freezers keeping all products solidly frozen.', subItems:['Products in Walk-in freezer warmer than 0°F (-18°C)','Products in primary storage freezer warmer than 0°F (-18°C)','Products in reach-in freezer not solidly frozen','Products in kitchen wall freezer not solidly frozen','Products in grill side freezer not solidly frozen','Products in back up freezer warmer than 5°F (-15°C)','Other'] },
  { code:'FS24', isCritical:false, points:3, title:'Refrigerated Products', description:'All products in walk-in refrigerator and any other primary storage refrigerator at or below 40°F (4°C) (including shake/sundae in reservoir). All products in secondary storage refrigerators keeping at correct temperature.', subItems:['Primary storage products not at correct temperature','Secondary storage products not at correct temperature','Other'] },
  { code:'FS25', isCritical:false, points:3, title:'Shelf Lives', description:'All in-use refrigerated products held in refrigerators and at room temperature marked and being used within their secondary shelf lives.', subItems:['Products not labelled','Products past shelf life','Other'] },
  { code:'FS26', isCritical:false, points:3, title:'Leftover Heated Foods', description:'All leftover heated foods are discarded (including expired food in the UHC and any shake/sundae mix removed from heat treatment). Heated food products (proteins) are not held beyond their defined time if held below 140°F (60°C).', subItems:['Products in UHC held beyond their defined time if below 140°F (60°C)','Shake/Sundae mix removed after heat treatment not discarded','Other'] },
  { code:'FS27', isCritical:false, points:5, title:'Pyrometer', description:'The pyrometer and accessories (e.g. probes) are clean, calibrated, working correctly, and used correctly (spare batteries and probe available).', subItems:['Probes set not complete / missing','Pyrometer not calibrated','Pyrometer / probes damaged','Pyrometer / probes dirty','Unapproved pyrometer in use','Pyrometer not used correctly','Needle not sanitized when used for ready to eat product','Needle not sanitized after unacceptable temperature','Spare batteries and probe not available','Other'] },
  { code:'FS28', isCritical:false, points:5, title:'Sourcing', description:'All food, food packaging, equipment (including utensils), and cleaning chemicals are from approved sources.', subItems:['Food not from approved sources','Packaging not from approved sources','Equipment not from approved sources','Cleaning chemicals not from approved sources','Other'] },
  { code:'FS29', isCritical:false, points:5, title:'Employee Health', description:'Managers understand employee illness symptoms and reportable illness causes for when an employee cannot be working. Managers also understand when an employee can return to work after illness.', subItems:['Crew / Managers do not know / are not aware of symptoms that would prevent them from working','Visibly ill employee working','Manager does not know the procedure to follow when presented with an ill worker','Manager does not know when an ill worker would be allowed to return to work','Procedures not in place to follow-up on employees health prior to the start of every shift','Other'] },
  { code:'FS30', isCritical:false, points:5, title:'Staff Training', description:"All managers (including shift managers) trained and certified in food safety per local requirements or McDonald's minimum requirements. The staff is trained on food safety per global requirements and market expectations before commencing work.", subItems:['Proof of food safety training (e.g. certificate) not available','Food safety certificate not on file/does not exist','Certification is overdue and needs to be reissued','Not all staff have been trained (e.g. no sign off)','No roster to follow-up to ensure all staff have been trained','Staff are not able to properly articulate their safety & sanitation roles and responsibilities','Other'] },
  { code:'FS31', isCritical:false, points:5, title:'Food Safety Checklists', description:'The last 60 days Daily Food Safety Checklists (DFSC) and past two Monthly Food Safety Procedures Verifications (MFSPV) are available. There is no evidence of system failures.', subItems:['Last 60 days completed Daily Food Safety Book (records) not available','Evidence of systematic failures in Daily Food Safety Checklist','Last two completed Monthly Food Safety Procedure Verifications are not available','Same point in both checklists incorrectly completed for last two Monthly FSPV','Corrections, corrective actions and plans not noted','Corrections, corrective actions, plans not followed or completed','Other'] },
  { code:'FS32', isCritical:false, points:5, title:'Audits', description:'Review the most recent health department inspection, audit (external, if applicable) report. All food safety violations noted by the health department been corrected or have a plan in place to correct issues.', subItems:['Health department inspection report not available (if provided by health authority)','Violations noted by Health Department have not been corrected','Internal audit report not available','Violations noted by internal audit have not been corrected','External audit report not available','Violations noted by external audit have not been corrected','Other'] },
  { code:'FS33', isCritical:false, points:5, title:'Allergen Management', description:'Market specific allergen management program in place.', subItems:['Allergen information not available for staff','Staff not aware of the correct procedure to follow when dealing with customer request for allergen information','Local requirements not adhered to','Other'] },
]

export async function POST() {
  try {
    // Check if already seeded
    const existing = await prisma.checklistTemplate.count()
    if (existing > 0) {
      return NextResponse.json(
        { message: `Already seeded. ${existing} templates found. No changes made.` },
        { status: 200 }
      )
    }

    const results: string[] = []

    for (let i = 0; i < CHECKLIST_DATA.length; i++) {
      const item = CHECKLIST_DATA[i]

      await prisma.checklistTemplate.create({
        data: {
          code:        item.code,
          title:       item.title,
          description: item.description,
          points:      item.points,
          isCritical:  item.isCritical,
          section:     codeToSection[item.code],
          sortOrder:   i,
          subItems: {
            create: item.subItems.map((label, idx) => ({
              label,
              sortOrder: idx,
            })),
          },
        },
      })

      results.push(`${item.code} - ${item.title}`)
    }

    return NextResponse.json({
      message: `Successfully seeded ${results.length} checklist templates`,
      seeded: results,
    }, { status: 201 })

  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed checklist templates' },
      { status: 500 }
    )
  }
}