const form = document.getElementById("planner-form");
const resultsSection = document.getElementById("results");
const planTitle = document.getElementById("plan-title");
const planSummary = document.getElementById("plan-summary");
const statCards = document.getElementById("stat-cards");
const bodyStatus = document.getElementById("body-status");
const recoveryStatus = document.getElementById("recovery-status");
const officePlan = document.getElementById("office-plan");
const healthGuidance = document.getElementById("health-guidance");
const trainingPlan = document.getElementById("training-plan");
const weeklyStatus = document.getElementById("weekly-status");
const foodPlan = document.getElementById("food-plan");
const supplementPlan = document.getElementById("supplement-plan");
const dailyRules = document.getElementById("daily-rules");
const printButton = document.getElementById("print-plan");
const doctorAlert = document.getElementById("doctor-alert");

const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
};

const REGION_FOODS = {
  india: {
    carbs: ["rice", "roti", "oats", "poha", "idli", "upma"],
    proteinsOmni: ["eggs", "chicken", "fish", "curd", "paneer", "dal"],
    proteinsVeg: ["paneer", "tofu", "dal", "chana", "rajma", "Greek yogurt"],
    fats: ["peanuts", "almonds", "seeds", "ghee in moderation"],
    vegetables: ["spinach", "beans", "carrot", "capsicum", "cucumber"],
  },
  usa: {
    carbs: ["oats", "potatoes", "rice", "whole grain bread", "fruit"],
    proteinsOmni: ["eggs", "chicken breast", "turkey", "Greek yogurt", "salmon"],
    proteinsVeg: ["tofu", "tempeh", "Greek yogurt", "beans", "lentils"],
    fats: ["avocado", "nuts", "olive oil", "peanut butter"],
    vegetables: ["broccoli", "leafy greens", "bell peppers", "carrots"],
  },
  europe: {
    carbs: ["oats", "potatoes", "whole grain bread", "rice", "pasta"],
    proteinsOmni: ["eggs", "chicken", "tuna", "Greek yogurt", "cottage cheese"],
    proteinsVeg: ["lentils", "quark", "Greek yogurt", "tofu", "beans"],
    fats: ["olive oil", "nuts", "seeds", "dark chocolate"],
    vegetables: ["salad greens", "zucchini", "tomatoes", "broccoli"],
  },
  middleeast: {
    carbs: ["rice", "flatbread", "oats", "potatoes", "dates"],
    proteinsOmni: ["eggs", "chicken", "fish", "labneh", "yogurt"],
    proteinsVeg: ["lentils", "chickpeas", "labneh", "tofu", "beans"],
    fats: ["olive oil", "tahini", "nuts", "seeds"],
    vegetables: ["cucumber", "tomato", "parsley", "lettuce", "eggplant"],
  },
  eastasia: {
    carbs: ["rice", "noodles", "oats", "sweet potato", "fruit"],
    proteinsOmni: ["eggs", "fish", "chicken", "tofu", "yogurt"],
    proteinsVeg: ["tofu", "edamame", "tempeh", "beans", "soy milk"],
    fats: ["sesame", "nuts", "avocado", "olive oil"],
    vegetables: ["bok choy", "spinach", "mushrooms", "seaweed", "broccoli"],
  },
  default: {
    carbs: ["oats", "rice", "potatoes", "whole grains", "fruit"],
    proteinsOmni: ["eggs", "chicken", "fish", "Greek yogurt", "beans"],
    proteinsVeg: ["tofu", "beans", "lentils", "Greek yogurt", "paneer"],
    fats: ["nuts", "seeds", "olive oil", "peanut butter"],
    vegetables: ["greens", "broccoli", "carrot", "cucumber", "peppers"],
  },
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  const plan = buildPlan(normalizeInput(data));
  renderPlan(plan);
});

printButton.addEventListener("click", () => window.print());

function normalizeInput(data) {
  return {
    ...data,
    age: Number(data.age),
    heightCm: Number(data.heightCm),
    weightKg: Number(data.weightKg),
    targetWeightKg: Number(data.targetWeightKg),
    daysPerWeek: Number(data.daysPerWeek),
    officeHours: Number(data.officeHours),
    commuteMinutes: Number(data.commuteMinutes),
    sessionMinutes: Number(data.sessionMinutes),
    sleepHours: Number(data.sleepHours),
    mealsPerDay: Number(data.mealsPerDay),
    currentWater: Number(data.currentWater),
  };
}

function buildPlan(profile) {
  const bmiCurrent = calculateBmi(profile.weightKg, profile.heightCm);
  const bmiTarget = calculateBmi(profile.targetWeightKg, profile.heightCm);
  const bmr = calculateBmr(profile);
  const maintenanceCalories = Math.round(bmr * ACTIVITY_FACTORS[profile.activityLevel]);
  const calorieTarget = getCalorieTarget(profile.goal, maintenanceCalories);
  const proteinGrams = getProteinTarget(profile);
  const waterLiters = getWaterTarget(profile);
  const sleepTarget = profile.stress === "high" || profile.goal === "muscle" ? 8 : 7.5;
  const regionFoods = getRegionFoods(profile.region);
  const doctorFlag = shouldShowDoctorFlag(profile);
  const workoutTemplate = buildWorkoutTemplate(profile);

  return {
    profile,
    bmiCurrent,
    bmiTarget,
    bmr,
    maintenanceCalories,
    calorieTarget,
    proteinGrams,
    waterLiters,
    sleepTarget,
    regionFoods,
    doctorFlag,
    recoveryScore: getRecoveryScore(profile, waterLiters, sleepTarget),
    officeRoutine: buildOfficeRoutine(profile),
    healthGuidance: buildHealthGuidance(profile),
    workouts: buildWorkoutWeeks(profile, workoutTemplate),
    weeklyStatus: buildWeeklyStatus(profile),
    meals: buildMealPlan(profile, regionFoods, calorieTarget, proteinGrams),
    supplements: buildSupplementPlan(profile),
    rules: buildDailyRules(profile, waterLiters, proteinGrams, sleepTarget),
  };
}

function calculateBmi(weightKg, heightCm) {
  const heightM = heightCm / 100;
  return (weightKg / (heightM * heightM)).toFixed(1);
}

function calculateBmr(profile) {
  const height = profile.heightCm;
  const weight = profile.weightKg;
  const age = profile.age;

  if (profile.sex === "female") {
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }

  if (profile.sex === "other") {
    const male = 10 * weight + 6.25 * height - 5 * age + 5;
    const female = 10 * weight + 6.25 * height - 5 * age - 161;
    return Math.round((male + female) / 2);
  }

  return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
}

function getCalorieTarget(goal, maintenanceCalories) {
  switch (goal) {
    case "muscle":
      return maintenanceCalories + 250;
    case "fat-loss":
      return maintenanceCalories - 350;
    case "recomp":
      return maintenanceCalories;
    default:
      return maintenanceCalories - 50;
  }
}

function getProteinTarget(profile) {
  const ratioMap = {
    muscle: 2,
    "fat-loss": 2.1,
    recomp: 2,
    fitness: 1.7,
  };
  return Math.round(profile.weightKg * ratioMap[profile.goal]);
}

function getWaterTarget(profile) {
  let liters = profile.weightKg * 0.035;

  if (profile.climate === "hot") liters += 0.8;
  if (profile.climate === "cold") liters -= 0.2;
  if (profile.daysPerWeek >= 5) liters += 0.4;
  if (profile.sessionMinutes >= 45) liters += 0.3;

  return Math.max(2.2, Number(liters.toFixed(1)));
}

function getRecoveryScore(profile, waterLiters, sleepTarget) {
  let score = 72;

  if (profile.sleepHours >= sleepTarget) score += 10;
  if (profile.sleepHours < 6.5) score -= 12;
  if (profile.stress === "high") score -= 12;
  if (profile.stress === "low") score += 6;
  if (profile.currentWater >= waterLiters) score += 6;
  if (profile.currentWater < waterLiters - 1) score -= 8;

  return Math.max(40, Math.min(96, score));
}

function getRegionFoods(regionInput) {
  const region = regionInput.toLowerCase();

  if (region.includes("india") || region.includes("south asia")) return REGION_FOODS.india;
  if (region.includes("usa") || region.includes("america") || region.includes("canada")) return REGION_FOODS.usa;
  if (region.includes("europe") || region.includes("uk") || region.includes("germany")) return REGION_FOODS.europe;
  if (region.includes("dubai") || region.includes("gulf") || region.includes("middle")) return REGION_FOODS.middleeast;
  if (region.includes("japan") || region.includes("china") || region.includes("korea") || region.includes("asia")) return REGION_FOODS.eastasia;

  return REGION_FOODS.default;
}

function shouldShowDoctorFlag(profile) {
  const warningWords = ["pain", "injury", "asthma", "diabetes", "bp", "heart", "surgery", "disc", "knee", "back"];
  const note = `${profile.conditions} ${profile.lifestyle}`.toLowerCase();
  return profile.age < 18 || warningWords.some((word) => note.includes(word));
}

function buildWorkoutTemplate(profile) {
  const pushMove = profile.equipment === "dumbbells" || profile.equipment === "both"
    ? "Dumbbell floor press or push-up"
    : "Push-up progression";
  const lowerMove = profile.equipment === "dumbbells" || profile.equipment === "both"
    ? "Goblet squat"
    : "Tempo squat";
  const hingeMove = profile.equipment === "dumbbells" || profile.equipment === "both"
    ? "Romanian dumbbell deadlift"
    : "Hip hinge + glute bridge";
  const pullMove = profile.pullupBar === "yes"
    ? "Pull-up or hanging row progression"
    : profile.equipment === "bands" || profile.equipment === "both"
      ? "Band row"
      : "Towel row or reverse snow angel";

  return {
    dayA: [pushMove, lowerMove, "Plank hold", "Mountain climbers finisher"],
    dayB: [pullMove, hingeMove, "Split squat", "Dead bug + hollow hold"],
    dayC: ["Pike push-up or shoulder press", "Walking lunge", "Burpee or squat-thrust", "Side plank"],
    conditioning: ["Brisk walk or jog", "High knees", "Bear crawl", "Mobility flow"],
  };
}

function buildWorkoutWeeks(profile, template) {
  const weeks = [];
  const intensity = profile.experience === "beginner" ? [2, 3, 3, 2] : [3, 3, 4, 2];
  const progression = [
    "Learn clean form and stop 2 reps before failure.",
    "Add 1 set to main moves or add 2 reps per set.",
    "Push intensity: slower tempo, harder variation, or slightly heavier dumbbells.",
    "Deload and sharpen: reduce volume by 20% while keeping technique crisp.",
  ];

  for (let week = 0; week < 4; week += 1) {
    const days = [];
    const baseSets = intensity[week];
    const repRange = getRepRange(profile.goal, week);

    for (let day = 1; day <= profile.daysPerWeek; day += 1) {
      if (day === 1) {
        days.push(`Day ${day}: ${formatDay(template.dayA, baseSets, repRange)}`);
      } else if (day === 2) {
        days.push(`Day ${day}: ${formatDay(template.dayB, baseSets, repRange)}`);
      } else if (day === 3) {
        days.push(`Day ${day}: ${formatDay(template.dayC, baseSets, repRange)}`);
      } else if (day === 4) {
        days.push(`Day ${day}: ${formatDay(template.conditioning, 3, "30-40 sec rounds")}`);
      } else if (day === 5) {
        days.push(`Day ${day}: Repeat Day 1 with slightly easier pace and perfect form.`);
      } else {
        days.push(`Day ${day}: Active recovery, long walk, mobility, breathing, light core.`);
      }
    }

    weeks.push({
      title: `Week ${week + 1}`,
      badge: week === 0 ? "Foundation" : week === 1 ? "Volume" : week === 2 ? "Intensity" : "Reset + lock in",
      notes: progression[week],
      days,
    });
  }

  return weeks;
}

function getRepRange(goal, week) {
  if (goal === "fat-loss") return week < 2 ? "10-14 reps" : "12-16 reps";
  if (goal === "muscle") return week < 2 ? "8-12 reps" : "10-12 reps";
  if (goal === "recomp") return "8-14 reps";
  return "10-15 reps";
}

function formatDay(exercises, sets, repRange) {
  return exercises.map((exercise) => `${exercise} - ${sets} sets of ${repRange}`).join("; ");
}

function buildWeeklyStatus(profile) {
  const gainFocus = profile.goal === "muscle";
  const cutFocus = profile.goal === "fat-loss";

  return [
    {
      week: "Week 1",
      goal: "Energy should rise and soreness should stay manageable.",
      markers: [
        "Follow all sessions without chasing exhaustion.",
        gainFocus ? "Eat on time even if appetite is low." : "Stop random snacking after dinner.",
        "Walk 7,000 to 9,000 steps on most days.",
      ],
    },
    {
      week: "Week 2",
      goal: "Body starts adapting, muscles feel fuller, movement feels cleaner.",
      markers: [
        "Add reps or load without breaking form.",
        gainFocus ? "Morning bodyweight may rise slightly." : "Waist should feel a little lighter.",
        "Water and sleep should feel more consistent.",
      ],
    },
    {
      week: "Week 3",
      goal: "Visible momentum week: stronger posture, better stamina, stronger pump.",
      markers: [
        "Push the hard sets close to effort 8/10.",
        "Notice easier push-ups, squats, planks, or faster recovery.",
        gainFocus ? "Arms, chest, or shoulders may look a bit fuller." : "Face and midsection may look tighter.",
      ],
    },
    {
      week: "Week 4",
      goal: "Finish fresh, not burnt out. Lock habits for the next block.",
      markers: [
        "Deload slightly and keep technique sharp.",
        cutFocus ? "Compare waist, photos, and energy, not just scale." : "Compare mirror, photos, and rep strength.",
        "Plan the next 4 weeks based on recovery and consistency.",
      ],
    },
  ];
}

function buildMealPlan(profile, foods, calorieTarget, proteinGrams) {
  const proteins = profile.dietType === "omnivore" ? foods.proteinsOmni : foods.proteinsVeg;
  const mealCount = profile.mealsPerDay;
  const meals = [
    {
      title: "Meal 1",
      focus: "Start strong",
      items: [
        `${foods.carbs[0]} + ${proteins[0]} + 1 fruit`,
        `Add ${foods.fats[0]} for steady energy`,
        "Drink 500 ml water within 30 minutes of waking",
      ],
    },
    {
      title: "Meal 2",
      focus: "Protein anchor",
      items: [
        `${proteins[1]} with ${foods.carbs[1]} and ${foods.vegetables[0]}`,
        "Keep this meal simple and easy to digest",
      ],
    },
    {
      title: "Meal 3",
      focus: "Main performance meal",
      items: [
        `${proteins[2] || proteins[0]} + ${foods.carbs[2]} + 2 vegetables`,
        "Best placed 2 to 3 hours before training if possible",
      ],
    },
    {
      title: "Meal 4",
      focus: "Recovery",
      items: [
        `${proteins[3] || proteins[0]} with fruit or lighter carbs`,
        "Post-workout: include protein within 60 to 90 minutes",
      ],
    },
  ];

  if (mealCount >= 5) {
    meals.push({
      title: "Meal 5",
      focus: "Top-up snack",
      items: [
        `${proteins[4] || proteins[0]} + ${foods.fats[1]}`,
        profile.goal === "muscle" ? "Use this to close your calorie gap." : "Keep this high-protein and moderate in calories.",
      ],
    });
  }

  if (mealCount === 6) {
    meals.push({
      title: "Meal 6",
      focus: "Before bed",
      items: [
        "Light protein snack such as yogurt, milk, tofu, paneer, or a protein shake",
        "Avoid very heavy oily meals late at night",
      ],
    });
  }

  return {
    calories: calorieTarget,
    proteinGrams,
    meals,
    notes: [
      `Target about ${proteinGrams} g protein daily.`,
      `Estimated intake: ${calorieTarget} kcal per day.`,
      `Choose local staples from your region: ${foods.carbs.slice(0, 3).join(", ")}.`,
      "If appetite is weak, use curd, smoothies, milk, banana, oats, soups, and softer foods.",
      "If digestion feels heavy, reduce fried food and split protein across more meals.",
    ],
  };
}

function buildSupplementPlan(profile) {
  const note = `${profile.conditions} ${profile.lifestyle}`.toLowerCase();
  const items = [
    "Whey or plant protein powder can help only if daily protein from food is not enough.",
    "Creatine monohydrate 3 to 5 g daily is one of the most evidence-backed options for strength and muscle.",
    "Electrolytes are useful in hot climates or if you sweat heavily.",
  ];

  if (!note.includes("fish")) {
    items.push("Omega-3 may be useful if fatty fish intake is low.");
  }

  items.push("Vitamin D or B12 should ideally be based on bloodwork or doctor guidance.");
  items.push("Protein bars are convenience foods, not mandatory. Prioritize real meals first.");

  if (profile.dietType === "vegan") {
    items.push("Vegan plans should pay extra attention to B12, iron, calcium, and total protein quality.");
  }

  return items;
}

function buildDailyRules(profile, waterLiters, proteinGrams, sleepTarget) {
  return [
    `Hit ${waterLiters} L water daily, and add more around training.`,
    `Reach ${proteinGrams} g protein across ${profile.mealsPerDay} meals.`,
    `Sleep target: ${sleepTarget} hours. Try a fixed sleep and wake time.`,
    `Leave 1 to 2 reps in reserve on most sets during week 1.`,
    `Spend 5 minutes before workouts on mobility and joint warm-up.`,
    `Take waist, weight, front photo, and side photo once each week at the same time.`,
    "If pain feels sharp, nerve-like, or joint-specific, stop and get medical advice.",
  ];
}

function buildHealthGuidance(profile) {
  const text = `${profile.conditions} ${profile.lifestyle}`.toLowerCase();
  const matched = [];

  const rules = [
    {
      keys: ["back", "lower back", "slip disc", "disc"],
      title: "Back pain or spinal discomfort",
      doList: [
        "Prioritize walking, gentle mobility, dead bug, bird-dog, and controlled glute bridge work.",
        "Keep core braced during squats, hinges, and pushing exercises.",
        "Use slow tempo and stop immediately if pain radiates or sharpens.",
      ],
      avoidList: [
        "Avoid high-impact jumping or heavy loaded bending from the floor in pain phases.",
        "Do not push through nerve-like pain, tingling, or pain shooting into the leg.",
      ],
      consult: "See a doctor or physiotherapist if pain is severe, radiating, or lasts more than a few days.",
    },
    {
      keys: ["knee", "knees"],
      title: "Knee pain",
      doList: [
        "Use chair squats, box squats, glute bridges, calf raises, and controlled split-squat range.",
        "Warm up with ankle mobility and light quad activation before training.",
        "Keep knee tracking in line with toes and use pain-free range only.",
      ],
      avoidList: [
        "Avoid deep painful squats, jump-heavy circuits, and twisting under load.",
        "Do not ignore swelling or locking sensations.",
      ],
      consult: "Consult a clinician if the knee swells, buckles, locks, or hurts during daily walking.",
    },
    {
      keys: ["shoulder"],
      title: "Shoulder pain",
      doList: [
        "Use incline push-ups, wall slides, band pull-aparts, and light rowing patterns first.",
        "Keep elbow angle comfortable and favor pain-free pressing range.",
        "Add shoulder blade control work before upper-body sessions.",
      ],
      avoidList: [
        "Avoid aggressive overhead pressing or deep dips if they pinch.",
        "Do not force range of motion through joint pain.",
      ],
      consult: "Get medical guidance if lifting the arm is painful at rest or pain disturbs sleep.",
    },
    {
      keys: ["neck"],
      title: "Neck pain or stiffness",
      doList: [
        "Do posture resets, chin tucks, upper-back mobility, and light walking breaks.",
        "Keep screens at eye level and reduce long static sitting.",
      ],
      avoidList: [
        "Avoid jerky ab work, heavy shrugging, and exercises that trigger headaches or arm tingling.",
      ],
      consult: "Seek care if neck pain causes numbness, tingling, weakness, or frequent headaches.",
    },
    {
      keys: ["asthma"],
      title: "Asthma or breathing sensitivity",
      doList: [
        "Use longer warm-ups and increase intensity gradually.",
        "Keep rescue medication accessible if prescribed by your doctor.",
        "Prefer steady conditioning and nasal breathing on easy efforts.",
      ],
      avoidList: [
        "Avoid sudden all-out circuits without warm-up.",
        "Do not train through wheezing, chest tightness, or unusual breathlessness.",
      ],
      consult: "Doctor review is important if symptoms are frequent or exercise regularly triggers attacks.",
    },
    {
      keys: ["diabetes", "sugar"],
      title: "Blood sugar or diabetes concerns",
      doList: [
        "Keep meal timing consistent and avoid long gaps before training.",
        "Track energy, dizziness, and hydration carefully around workouts.",
        "Carry a quick carb source if your doctor has advised it.",
      ],
      avoidList: [
        "Avoid intense fasted training unless medically cleared.",
        "Do not guess around medication timing and hard exercise.",
      ],
      consult: "Talk with your doctor about workout intensity, meal timing, and medicines before following the plan closely.",
    },
    {
      keys: ["bp", "blood pressure", "hypertension"],
      title: "Blood pressure concerns",
      doList: [
        "Use controlled breathing and moderate effort rather than constant all-out sets.",
        "Favor walking, light circuits, and gradual strength progression.",
      ],
      avoidList: [
        "Avoid holding your breath during hard reps.",
        "Avoid maximal effort testing or very intense conditioning if readings are not controlled.",
      ],
      consult: "Medical clearance is wise if blood pressure is uncontrolled or symptoms include dizziness or chest discomfort.",
    },
    {
      keys: ["heart", "cardiac", "chest pain"],
      title: "Heart-related history",
      doList: [
        "Keep exercise moderate and steady unless a doctor has cleared harder training.",
        "Track unusual fatigue, chest sensations, and breathlessness carefully.",
      ],
      avoidList: [
        "Avoid self-prescribing intense bootcamp-style sessions.",
        "Do not ignore chest pain, fainting, or pressure symptoms.",
      ],
      consult: "Doctor approval is strongly recommended before starting the full program.",
    },
    {
      keys: ["surgery", "operation"],
      title: "Recent surgery or medical procedure",
      doList: [
        "Return gradually and prioritize walking, mobility, and clinician-approved movements first.",
        "Follow your surgeon or physiotherapist timelines above any app guidance.",
      ],
      avoidList: [
        "Avoid loading the affected area before you are medically cleared.",
      ],
      consult: "You should follow direct medical advice first and use this app only as a secondary structure.",
    },
  ];

  rules.forEach((rule) => {
    if (rule.keys.some((key) => text.includes(key))) {
      matched.push(rule);
    }
  });

  if (!matched.length) {
    return {
      summary: "No specific condition keyword was detected. Use normal progressive training, but stop and reassess if any movement causes sharp, joint-specific, or radiating pain.",
      items: [
        {
          title: "General safety",
          doList: [
            "Warm up for 5 to 8 minutes before training.",
            "Use clean form and gradually increase reps or weight.",
            "Sleep, hydration, and recovery matter as much as exercise.",
          ],
          avoidList: [
            "Avoid ego training and pain-chasing.",
            "Do not use supplements or medicines blindly.",
          ],
          consult: "If pain appears and lasts, get medical advice before progressing hard.",
        },
      ],
    };
  }

  return {
    summary: "Your health notes triggered extra precaution guidance. Use the plan conservatively and follow the suggestions below along with doctor advice where needed.",
    items: matched,
  };
}

function buildOfficeRoutine(profile) {
  const officeLikeWork = ["office", "hybrid", "remote", "student"].includes(profile.workStyle);
  const workoutWindow = getWorkoutWindow(profile);
  const breakMove = getBreakMovePlan(profile);
  const mealStrategy = getOfficeMealStrategy(profile);

  const mainSummary = officeLikeWork
    ? `Your best training window is ${workoutWindow}. Because you spend about ${profile.officeHours} hours in ${profile.workStyle} work with a ${profile.commuteMinutes}-minute total commute, your plan should protect energy instead of depending on motivation at the end of the day.`
    : `Your work is more active, so the plan should keep training efficient and avoid over-fatigue around job hours. Your best training window is ${workoutWindow}.`;

  const timing = [];

  if (profile.preferredWorkoutTime === "morning") {
    timing.push("Wake, drink water, do a 5-minute mobility warm-up, then complete the main session before work.");
    timing.push("Use breakfast after training as your first recovery meal.");
  } else if (profile.preferredWorkoutTime === "lunch") {
    timing.push("Keep the session short and focused: 25 to 35 minutes, then eat a protein-centered lunch.");
    timing.push("Use mornings for a quick mobility reset so the midday workout feels easier.");
  } else if (profile.preferredWorkoutTime === "evening") {
    timing.push("Eat a solid afternoon meal or snack so evening training does not happen in a drained state.");
    timing.push("If office stress is high, begin with 5 minutes of walking and breathing before the session.");
  } else {
    timing.push("Use your lowest-friction time window each day and protect at least 3 anchor training sessions weekly.");
    timing.push("Keep one short backup workout for unpredictable workdays.");
  }

  return {
    summary: mainSummary,
    timing,
    breakMove,
    mealStrategy,
  };
}

function getWorkoutWindow(profile) {
  if (profile.preferredWorkoutTime === "morning") return "morning before work";
  if (profile.preferredWorkoutTime === "lunch") return "lunch break or midday";
  if (profile.preferredWorkoutTime === "evening") return "evening after work";

  if (profile.commuteMinutes >= 90) return "morning, because long commute days drain evening consistency";
  if (profile.officeHours >= 10) return "morning or lunch, because very long office hours make late workouts harder";
  return "the most reliable open slot in your day";
}

function getBreakMovePlan(profile) {
  if (profile.breakFlexibility === "low") {
    return [
      "Every 60 to 90 minutes: stand up for 2 minutes, walk to water, and reset posture.",
      "At desk: 10 shoulder rolls, 10 neck resets, 10 seated knee lifts, 20 seconds glute squeeze.",
      "Use bathroom or corridor trips as micro-cardio instead of staying seated continuously.",
    ];
  }

  if (profile.breakFlexibility === "medium") {
    return [
      "Every 60 minutes: 3 to 4 minutes of brisk walking or stair climbing.",
      "Do 10 desk push-ups, 10 chair squats, and 20 calf raises during one break.",
      "Take at least one sunlight walk after lunch to reduce stiffness and sleep disruption.",
    ];
  }

  return [
    "Every hour: 3 to 5 minutes of movement, ideally walking, stairs, or mobility.",
    "Use one daily break for a quick circuit: 12 chair squats, 10 incline push-ups, 20 marching steps, 20-second plank if space allows.",
    "Aim to split sitting time often so office hours do not cancel out training benefits.",
  ];
}

function getOfficeMealStrategy(profile) {
  const items = [];

  if (profile.appetite === "low") {
    items.push("Carry easy foods for office hours: yogurt, banana, soaked oats, protein shake, nuts, or a simple sandwich.");
  } else {
    items.push("Pre-pack one protein-focused office meal and one backup snack so random hunger does not lead to junk food.");
  }

  items.push("Drink water in fixed checkpoints: after arrival, before lunch, mid-afternoon, and before leaving work.");
  items.push("Keep lunch balanced with protein + carbs + vegetables so energy does not crash in the second half of work.");

  if (profile.preferredWorkoutTime === "evening") {
    items.push("Take a pre-workout office snack 60 to 90 minutes before leaving: fruit + yogurt, eggs + toast, or a protein bar.");
  }

  if (profile.preferredWorkoutTime === "morning") {
    items.push("Use lunch and afternoon meals to continue recovery from the morning workout rather than skipping meals.");
  }

  return items;
}

function renderPlan(plan) {
  const { profile } = plan;

  resultsSection.classList.remove("hidden");
  planTitle.textContent = `${profile.name}'s 4-week muscle and health plan`;
  planSummary.textContent =
    `Built for ${profile.goal} with ${profile.daysPerWeek} training days per week, ` +
    `${profile.sessionMinutes}-minute sessions, ${profile.equipment} setup, and ${profile.region} food context.`;
  document.title = `ForgeFit Plan - ${profile.name}`;

  renderDoctorAlert(plan);
  renderStats(plan);
  renderBodyStatus(plan);
  renderRecovery(plan);
  renderOfficePlan(plan.officeRoutine);
  renderHealthGuidance(plan.healthGuidance);
  renderTraining(plan.workouts);
  renderWeeklyStatus(plan.weeklyStatus);
  renderMeals(plan.meals);
  renderSupplements(plan.supplements);
  renderRules(plan.rules);

  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderDoctorAlert(plan) {
  if (!plan.doctorFlag) {
    doctorAlert.classList.add("hidden");
    doctorAlert.textContent = "";
    return;
  }

  doctorAlert.classList.remove("hidden");
  doctorAlert.textContent =
    "Medical note: because your form mentions young age, pain, injury, or a health condition, a doctor or qualified physiotherapist should clear intense training, supplements, or medicines before you follow this plan fully.";
}

function renderStats(plan) {
  const cards = [
    ["Current BMI", plan.bmiCurrent, "Health status now"],
    ["Target BMI", plan.bmiTarget, "Projected target zone"],
    ["Calories/day", plan.calorieTarget, `Maintenance ${plan.maintenanceCalories} kcal`],
    ["Protein/day", `${plan.proteinGrams} g`, "Daily muscle target"],
    ["Water/day", `${plan.waterLiters} L`, "Adjusted for body and climate"],
  ];

  statCards.innerHTML = cards
    .map(
      ([label, value, note]) => `
        <article class="stat-card">
          <small>${label}</small>
          <strong>${value}</strong>
          <small>${note}</small>
        </article>
      `
    )
    .join("");
}

function renderBodyStatus(plan) {
  const weightChange = (plan.profile.targetWeightKg - plan.profile.weightKg).toFixed(1);
  const goalTone =
    plan.profile.goal === "fat-loss"
      ? "Fat-loss focus"
      : plan.profile.goal === "muscle"
        ? "Muscle-gain focus"
        : "Balanced recomposition";

  bodyStatus.innerHTML = `
    <div class="split-stat">
      <div class="mini-panel">
        <small>Current body status</small>
        <strong>${plan.profile.weightKg} kg</strong>
        <span class="micro-chip">BMI ${plan.bmiCurrent}</span>
      </div>
      <div class="mini-panel alt">
        <small>Planned direction</small>
        <strong>${plan.profile.targetWeightKg} kg</strong>
        <span class="micro-chip">${weightChange > 0 ? "+" : ""}${weightChange} kg target</span>
      </div>
    </div>
    <p>${goalTone}. Over 4 weeks the main win is better energy, visible consistency, better posture, and improved strength markers rather than an extreme body transformation.</p>
  `;
}

function renderRecovery(plan) {
  const thirstGap = Math.max(0, (plan.waterLiters - plan.profile.currentWater).toFixed(1));
  recoveryStatus.innerHTML = `
    <div class="split-stat">
      <div class="mini-panel">
        <small>Recovery score</small>
        <strong>${plan.recoveryScore}/100</strong>
        <p class="print-note">Higher is better. Built from sleep, stress, and hydration inputs.</p>
      </div>
      <div class="mini-panel alt">
        <small>Sleep target</small>
        <strong>${plan.sleepTarget} hrs</strong>
        <p class="print-note">Current average: ${plan.profile.sleepHours} hrs</p>
      </div>
    </div>
    <ul class="plain-list">
      <li>Daily water target: ${plan.waterLiters} L.</li>
      <li>${thirstGap > 0 ? `Increase your current intake by about ${thirstGap} L.` : "Your current water intake is near target."}</li>
      <li>High stress days: shorten the workout slightly instead of skipping completely.</li>
    </ul>
  `;
}

function renderOfficePlan(plan) {
  officePlan.innerHTML = `
    <p>${plan.summary}</p>
    <div class="mini-panel">
      <small>Workout timing</small>
      <ul class="plain-list">${plan.timing.map((item) => `<li>${item}</li>`).join("")}</ul>
    </div>
    <div class="mini-panel alt">
      <small>During office hours</small>
      <ul class="plain-list">${plan.breakMove.map((item) => `<li>${item}</li>`).join("")}</ul>
    </div>
    <div class="mini-panel">
      <small>Office food and water</small>
      <ul class="plain-list">${plan.mealStrategy.map((item) => `<li>${item}</li>`).join("")}</ul>
    </div>
  `;
}

function renderHealthGuidance(plan) {
  healthGuidance.innerHTML = `
    <p>${plan.summary}</p>
    ${plan.items
      .map(
        (item) => `
          <article class="week-card">
            <header>
              <h4>${item.title}</h4>
              <span class="badge">Do / Avoid</span>
            </header>
            <p><strong>Do:</strong></p>
            <ul class="plain-list">${item.doList.map((entry) => `<li>${entry}</li>`).join("")}</ul>
            <p><strong>Avoid:</strong></p>
            <ul class="plain-list">${item.avoidList.map((entry) => `<li>${entry}</li>`).join("")}</ul>
            <p><strong>Medical note:</strong> ${item.consult}</p>
          </article>
        `
      )
      .join("")}
  `;
}

function renderTraining(workouts) {
  trainingPlan.innerHTML = workouts
    .map(
      (week) => `
        <article class="week-card">
          <header>
            <h4>${week.title}</h4>
            <span class="badge">${week.badge}</span>
          </header>
          <p>${week.notes}</p>
          <ul>${week.days.map((day) => `<li>${day}</li>`).join("")}</ul>
        </article>
      `
    )
    .join("");
}

function renderWeeklyStatus(items) {
  weeklyStatus.innerHTML = items
    .map(
      (item) => `
        <article class="week-card">
          <header>
            <h4>${item.week}</h4>
            <span class="badge">Status check</span>
          </header>
          <p>${item.goal}</p>
          <ul>${item.markers.map((marker) => `<li>${marker}</li>`).join("")}</ul>
        </article>
      `
    )
    .join("");
}

function renderMeals(meals) {
  const mealCards = meals.meals
    .map(
      (meal) => `
        <article class="meal-card">
          <h4>${meal.title}</h4>
          <p>${meal.focus}</p>
          <ul>${meal.items.map((item) => `<li>${item}</li>`).join("")}</ul>
        </article>
      `
    )
    .join("");

  const notesCard = `
    <article class="meal-card">
      <h4>Food strategy</h4>
      <ul>${meals.notes.map((note) => `<li>${note}</li>`).join("")}</ul>
    </article>
  `;

  foodPlan.innerHTML = mealCards + notesCard;
}

function renderSupplements(items) {
  supplementPlan.innerHTML = `<ul class="plain-list">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function renderRules(items) {
  dailyRules.innerHTML = `<ul class="plain-list">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}
