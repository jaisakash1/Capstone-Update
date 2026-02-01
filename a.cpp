#include <iostream>
#include <string>
using namespace std;

struct Patient {
    string gender;
    int age;
    int time_in_hospital;
    int emergency_visits;
    int inpatient_visits;

    string a1c;       // Normal / Abnormal
    string glucose;   // Normal / Abnormal
    string diabetesMed;
};

bool eliminateCheck(Patient p) {

    if (p.time_in_hospital < 2) {
        cout << "\n❌ Eliminated: Stay too short\n";
        return true;
    }

    if (p.emergency_visits > 3) {
        cout << "\n❌ Eliminated: Too many emergency visits\n";
        return true;
    }

    if (p.diabetesMed == "No") {
        cout << "\n❌ Eliminated: Not on diabetes medication\n";
        return true;
    }

    if (p.a1c == "Normal") {
        cout << "\n❌ Eliminated: A1C is normal (low priority)\n";
        return true;
    }

    return false;
}

void getLabReports(Patient &p) {
    string haveReport;

    // HbA1c
    cout << "\nDo you have HbA1c test report? (Yes/No): ";
    cin >> haveReport;

    if (haveReport == "No") {
        cout << "⚠ Please get HbA1c test done.\n";
        cout << "Suggested: Fasting lab test for HbA1c.\n";
        p.a1c = "Unknown";
    } else {
        cout << "Enter HbA1c result (Normal/Abnormal): ";
        cin >> p.a1c;
    }

    // Glucose
    cout << "\nDo you have Blood Glucose report? (Yes/No): ";
    cin >> haveReport;

    if (haveReport == "No") {
        cout << "⚠ Please get Glucose test done.\n";
        cout << "Suggested tests:\n";
        cout << "- Fasting Blood Sugar\n";
        cout << "- Post-meal Sugar Test\n";
        p.glucose = "Unknown";
    } else {
        cout << "Enter Glucose result (Normal/Abnormal): ";
        cin >> p.glucose;
    }
}

int main() {

    Patient p;
    int choice;

    cout << "🏥 Diabetes Intake CLI\n";

    do {
        cout << "\n---- MENU ----\n";
        cout << "1. Enter Patient Data\n";
        cout << "2. Exit\n";
        cout << "Choice: ";
        cin >> choice;

        if (choice == 1) {

            cout << "\nGender (Male/Female): ";
            cin >> p.gender;

            cout << "Age: ";
            cin >> p.age;

            cout << "Days in hospital: ";
            cin >> p.time_in_hospital;

            cout << "Emergency visits: ";
            cin >> p.emergency_visits;

            cout << "Inpatient visits: ";
            cin >> p.inpatient_visits;

            // 👉 NEW LAB REPORT SECTION
            getLabReports(p);

            cout << "\nOn diabetes medication? (Yes/No): ";
            cin >> p.diabetesMed;

            cout << "\nProcessing...\n";

            if (!eliminateCheck(p)) {
                cout << "\n✅ Patient Eligible for Program\n";
            }
        }

    } while (choice != 2);

    cout << "\nGoodbye!\n";
    return 0;
}
