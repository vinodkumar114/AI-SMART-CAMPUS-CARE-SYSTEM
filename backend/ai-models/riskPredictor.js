// Simulated AI Risk Calculation Logic (Hackathon ready)
// In a production system, this would call a Python microservice with a trained model 
// or use tensorflow.js. Here we use a weighted algorithm that acts as our "model".

const calculateRiskScore = (academicRecord, behaviorLog, wellnessCheckin) => {
  let score = 0;
  let factors = [];

  // 1. Academic Factors (Max 30 points)
  if (academicRecord) {
    if (academicRecord.attendancePercentage < 75) {
      score += 15;
      factors.push('Low attendance');
    } else if (academicRecord.attendancePercentage < 85) {
      score += 5;
    }

    if (academicRecord.averageExamScore < 50) {
      score += 15;
      factors.push('Poor academic performance');
    }
  } else {
    // Missing academic data adds a baseline uncertainty risk
    score += 10;
  }

  // 2. Behavioral Factors (Max 30 points)
  if (behaviorLog) {
    if (behaviorLog.campusEventParticipation === 0 && behaviorLog.libraryVisitsPerWeek === 0) {
      score += 15;
      factors.push('Social isolation / No campus participation');
    }
    if (behaviorLog.hostelMovementFlags > 3) {
      score += 15;
      factors.push('Concerning hostel movement patterns');
    }
  }

  // 3. Wellness / Self-Report Factors (Max 40 points)
  if (wellnessCheckin) {
    if (wellnessCheckin.moodScore <= 2) {
      score += 15;
      factors.push('Negative mood survey');
    }
    if (wellnessCheckin.stressLevel >= 8) {
      score += 15;
      factors.push('High stress levels reported');
    }
    if (wellnessCheckin.sleepHours < 5) {
      score += 10;
      factors.push('Severe sleep deprivation');
    }
  } else {
    score += 15; // Lack of check-in itself is a minor risk
  }

  // Determine Risk Level
  let riskLevel = 'Low';
  if (score >= 80) riskLevel = 'Critical';
  else if (score >= 60) riskLevel = 'High';
  else if (score >= 35) riskLevel = 'Medium';

  return {
    score: Math.min(score, 100), // Cap at 100
    riskLevel,
    factors
  };
};

module.exports = { calculateRiskScore };
