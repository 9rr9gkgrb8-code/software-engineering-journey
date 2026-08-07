print("Hello, World!")
print("My name is Kenneth.")
print("Today I officially started my software engineering journey.")
print("Launch Forge AI begins here.")
print()

goal = input("What's your goal for this journey? ")
timeline = input("What is your time frame for achieving this goal? ")
why = input("Why is this goal important to you? ")
confidence = int(input("On a scale of 1-10, how confident are you? "))

print()
print("=====================================")
print("          Launch Forge AI          ")
print("=====================================")
print(f"Goal:, {goal}")
print(f"Timeline:, {timeline}")
print(f"Reason:, {why}")
print(f"Confidence: {confidence}/10")
print("=====================================")
print("Mission Accepted.")
print("small steps every day become big victories.")
if confidence >= 8:
    print("You're ready to crush this journey!")
elif confidence >= 5:
    print("Keep building momentum every day.")
else:
    print("Every expert starts as a beginner. Keep moving forward and don't give up!")
