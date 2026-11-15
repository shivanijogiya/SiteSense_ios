from pathlib import Path
import pandas as pd, json, math

ROOT = Path(__file__).resolve().parents[1]
tele = pd.read_csv(ROOT / "data/raw/machine_telemetry_dataset_100k.csv")
tasks = pd.read_csv(ROOT / "data/raw/task_estimation_dataset_100k.csv")
tele["Timestamp"] = pd.to_datetime(tele["Timestamp"])

def machine_type(mid):
    return {"EXC":"Excavator","LOD":"Loader","DOZ":"Dozer","GRD":"Grader"}.get(mid[:3],"Machine")

def health_score(r):
    score = 100
    score -= min(30, r["alert_rate"] * 160)
    score -= min(18, r["seatbelt_violation_rate"] * 90)
    score -= max(0, min(15, (r["avg_idling"] - 17) * 0.5))
    score -= max(0, min(12, (r["avg_fuel"] - 7.0) * 2.0))
    score -= max(0, min(10, (r["engine_hours"] - 7000) / 400))
    return int(round(max(40, min(99, score))))

g = tele.groupby("Machine ID").agg(
    operator_id=("Operator ID", lambda x: x.mode().iloc[0]),
    engine_hours=("Engine Hours","max"),
    avg_fuel=("Fuel Used (L)","mean"),
    avg_load_cycles=("Load Cycles","mean"),
    avg_idling=("Idling Time (min)","mean"),
    alert_rate=("Safety Alert Triggered", lambda x:(x=="Yes").mean()),
    seatbelt_violation_rate=("Seatbelt Status", lambda x:(x=="Unfastened").mean())
).reset_index()

machines=[]
for _,r in g.iterrows():
    h=health_score(r)
    machines.append({
        "id":r["Machine ID"],"type":machine_type(r["Machine ID"]),
        "operatorId":r["operator_id"],"engineHours":round(float(r["engine_hours"]),1),
        "avgFuel":round(float(r["avg_fuel"]),1),"avgLoadCycles":round(float(r["avg_load_cycles"]),1),
        "avgIdling":round(float(r["avg_idling"]),1),"alertRatePct":round(float(r["alert_rate"]*100),1),
        "seatbeltViolationPct":round(float(r["seatbelt_violation_rate"]*100),1),
        "health":h,"status":"Ready" if h>=82 else ("Watch" if h>=68 else "Service Soon"),
        "serviceInHours":max(8,int(round(180-(r["engine_hours"]%180)))),
        "zone":f"Zone {chr(65 + (sum(map(ord, r['Machine ID'])) % 5))}"
    })

model = tasks.groupby(["Task Type","Weather","Operator Skill"]).agg(
    est=("Estimated Time (min)","mean"),actual=("Actual Time (min)","mean"),n=("Task ID","size")
).reset_index()
taskModel=[{"taskType":r["Task Type"],"weather":r["Weather"],"skill":r["Operator Skill"],
            "baseEstimated":round(float(r["est"]),1),"baseActual":round(float(r["actual"]),1),
            "samples":int(r["n"])} for _,r in model.iterrows()]

print(f"Rebuilt summaries for {len(machines)} machines and {len(taskModel)} task-model cells.")
print("This starter script intentionally leaves the UI seed tasks/alerts unchanged.")
