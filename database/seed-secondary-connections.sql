-- Seed: 60 well-documented VA secondary service connection relationships
-- Run in Supabase SQL Editor after creating the secondary_connections table

INSERT INTO secondary_connections (primary_condition, secondary_condition, relationship_strength, medical_rationale, cfr_or_precedent) VALUES
-- PTSD secondaries (8)
('PTSD', 'Sleep apnea', 'strong', 'PTSD hyperarousal disrupts sleep architecture, contributing to obstructive sleep apnea. Elevated sympathetic nervous system activity from chronic PTSD alters upper airway muscle tone during sleep.', 'VA Clinician''s Guide to PTSD; multiple BVA grants'),
('PTSD', 'Hypertension', 'strong', 'Chronic PTSD activates the hypothalamic-pituitary-adrenal axis, elevating cortisol and catecholamines. Sustained sympathetic nervous system activation raises blood pressure over time.', '38 CFR 3.310; Arzio v. Shinseki precedent'),
('PTSD', 'Erectile dysfunction', 'strong', 'PTSD medications (SSRIs, SNRIs) directly cause sexual dysfunction. Chronic stress hormones impair vascular and neurological pathways necessary for erectile function.', 'SMC-K eligible; widely granted secondary'),
('PTSD', 'Major depressive disorder', 'strong', 'PTSD and MDD share overlapping neurobiological pathways. Chronic trauma exposure frequently precipitates depressive episodes as a distinct comorbid condition.', '38 CFR 4.130; separate ratings when clinically distinct'),
('PTSD', 'GERD / acid reflux', 'strong', 'PTSD medications (SSRIs) cause gastrointestinal side effects. Chronic stress increases gastric acid production and impairs lower esophageal sphincter function.', 'Secondary to PTSD medications; BVA precedent'),
('PTSD', 'Substance use disorder', 'moderate', 'Self-medication with alcohol or drugs is a well-documented coping mechanism for PTSD symptoms. The VA recognizes substance abuse secondary to service-connected mental health conditions.', 'Allen v. Principi (2001); 38 CFR 3.310'),
('PTSD', 'Migraines', 'moderate', 'Chronic stress and hyperarousal from PTSD are documented migraine triggers. PTSD-related sleep disruption further increases migraine frequency and severity.', 'BVA grants on record; neurology nexus support'),
('PTSD', 'Irritable bowel syndrome', 'moderate', 'The gut-brain axis links chronic psychological stress to gastrointestinal motility disorders. PTSD medications also contribute to IBS symptoms.', 'VA research on gut-brain connection; BVA grants'),

-- TBI secondaries (7)
('TBI', 'Migraines', 'strong', 'Post-traumatic headaches are the single most common TBI residual. Blast and concussive injury damages pain-processing neural pathways, causing chronic migraine patterns.', '38 CFR 4.124a; DC 8100; most commonly granted TBI residual'),
('TBI', 'Sleep apnea', 'strong', 'TBI causes neurological damage to brainstem sleep regulation centers, directly contributing to sleep-disordered breathing and central/obstructive apnea.', 'Neurological nexus; BVA grants'),
('TBI', 'Depression', 'strong', 'TBI damages the frontal lobe and limbic system — brain regions that regulate mood. Depression rates in TBI patients are 3-5x the general population.', '38 CFR 4.130; separate from TBI cognitive rating'),
('TBI', 'Tinnitus', 'strong', 'Blast overpressure damages cochlear hair cells and auditory nerve fibers. Tinnitus is present in over 50% of blast-related TBI cases.', '38 CFR 4.87; DC 6260'),
('TBI', 'Hearing loss', 'strong', 'Same blast mechanism as tinnitus. Sensorineural hearing loss from acoustic trauma is a direct residual of blast-related TBI.', '38 CFR 4.85-4.87'),
('TBI', 'Vestibular dysfunction / vertigo', 'strong', 'TBI damages the vestibular system causing chronic dizziness, balance problems, and vertigo. Often underdiagnosed in mild TBI cases.', '38 CFR 4.87; DC 6204'),
('TBI', 'Cognitive disorder / memory impairment', 'strong', 'Diffuse axonal injury from TBI impairs executive function, processing speed, and memory. Rated under TBI residuals or separately when distinct.', '38 CFR 4.124a; DC 8045'),

-- Lumbar/cervical spine secondaries (6)
('Lumbar strain', 'Radiculopathy — left lower extremity', 'strong', 'Lumbar disc degeneration compresses L4-S1 nerve roots, causing radiating pain, numbness, or weakness in the left leg.', '38 CFR 4.71a / 4.124a; each extremity rated separately'),
('Lumbar strain', 'Radiculopathy — right lower extremity', 'strong', 'Same mechanism as left — lumbar disc pathology compresses nerve roots on the right side. Both extremities should be claimed if affected.', '38 CFR 4.71a / 4.124a'),
('Cervical strain', 'Radiculopathy — left upper extremity', 'strong', 'Cervical disc compression at C5-C7 causes radiating pain, numbness, or weakness in the left arm and hand.', '38 CFR 4.71a / 4.124a'),
('Cervical strain', 'Radiculopathy — right upper extremity', 'strong', 'Same cervical disc mechanism affecting the right arm. Dominant vs non-dominant arm ratings differ.', '38 CFR 4.71a / 4.124a'),
('Lumbar strain', 'Hip condition', 'moderate', 'Chronic lumbar pain alters gait mechanics, transferring abnormal mechanical load to the hip joints and accelerating degeneration.', 'Orthopedic nexus; BVA grants on gait alteration theory'),
('Lumbar strain', 'Erectile dysfunction', 'moderate', 'Lumbar nerve root compression can impair the S2-S4 nerve pathways that control erectile function. Also secondary to pain medications.', 'SMC-K eligible; neurological nexus'),

-- Knee secondaries (4)
('Knee condition', 'Hip condition — ipsilateral', 'moderate', 'Chronic knee instability or pain causes compensatory gait patterns that overload the hip joint on the same side.', 'Orthopedic nexus; altered gait mechanism'),
('Knee condition', 'Lumbar strain', 'moderate', 'Altered gait mechanics from knee pathology propagate upward through the kinetic chain, creating abnormal lumbar spine loading.', 'Kinetic chain theory; orthopedic nexus'),
('Knee condition', 'Hip condition — contralateral', 'possible', 'Favoring the injured knee shifts weight to the opposite leg, overloading the contralateral hip joint.', 'Contralateral compensation theory; requires strong nexus'),
('Knee condition', 'Ankle condition', 'possible', 'Knee instability alters ankle mechanics. Often seen after ACL or meniscus injury where compensatory ankle strain develops.', 'Orthopedic nexus; less commonly granted'),

-- Hearing loss / tinnitus (2)
('Hearing loss', 'Tinnitus', 'strong', 'Hearing loss and tinnitus share the same noise-damage mechanism. Cochlear damage from acoustic trauma produces both conditions simultaneously.', '38 CFR 4.87; DC 6260; always file both together'),
('Tinnitus', 'Hearing loss', 'strong', 'Same noise exposure that causes tinnitus also damages frequency-specific hearing. A formal audiology exam often reveals measurable hearing loss in tinnitus patients.', '38 CFR 4.85-4.87'),

-- Diabetes type 2 secondaries (7)
('Diabetes mellitus type 2', 'Peripheral neuropathy — bilateral lower extremities', 'strong', 'Diabetic peripheral neuropathy affects up to 50% of long-standing diabetics. Elevated blood glucose damages small nerve fibers in the feet and legs.', '38 CFR 4.124a; each extremity rated separately'),
('Diabetes mellitus type 2', 'Peripheral neuropathy — bilateral upper extremities', 'strong', 'Same mechanism as lower extremity neuropathy. Diabetic nerve damage progresses to the hands and arms in advanced cases.', '38 CFR 4.124a'),
('Diabetes mellitus type 2', 'Hypertension', 'strong', 'Diabetes damages blood vessel endothelium and impairs renal sodium handling, directly elevating blood pressure through multiple pathways.', '38 CFR 3.310; well-established medical link'),
('Diabetes mellitus type 2', 'Erectile dysfunction', 'strong', 'Diabetes causes both vascular and neurological damage that impairs erectile function. Affects over 50% of diabetic males.', 'SMC-K eligible; strong medical literature'),
('Diabetes mellitus type 2', 'Diabetic retinopathy', 'strong', 'Chronic hyperglycemia damages retinal blood vessels, causing vision impairment. Rated under eye conditions with separate diagnostic codes.', '38 CFR 4.79; DC 6006'),
('Diabetes mellitus type 2', 'Chronic kidney disease', 'strong', 'Diabetic nephropathy is the leading cause of chronic kidney disease. Sustained hyperglycemia damages the glomerular filtration system.', '38 CFR 4.115; renal conditions'),
('Diabetes mellitus type 2', 'Skin conditions (diabetic dermopathy)', 'moderate', 'Poor circulation and immune dysfunction from diabetes cause chronic skin conditions including ulcers, infections, and dermopathy.', '38 CFR 4.118; dermatological conditions'),

-- Sleep apnea secondaries (4)
('Sleep apnea', 'Hypertension', 'strong', 'Repeated nocturnal oxygen desaturation from apnea events triggers sympathetic activation and oxidative stress, chronically elevating blood pressure.', '38 CFR 3.310; strong medical literature support'),
('Sleep apnea', 'Depression', 'moderate', 'Chronic sleep deprivation from untreated sleep apnea disrupts serotonin and dopamine regulation, contributing to major depressive episodes.', 'Sleep medicine research; BVA grants'),
('Sleep apnea', 'Cognitive impairment', 'moderate', 'Intermittent hypoxia from sleep apnea causes neuronal damage in the hippocampus and prefrontal cortex, impairing memory and executive function.', 'Neuropsychological testing evidence'),
('Sleep apnea', 'GERD / acid reflux', 'moderate', 'Negative intrathoracic pressure from obstructive apnea events pulls gastric contents into the esophagus, causing or worsening reflux.', 'Pulmonology/GI nexus'),

-- Burn pit / toxic exposure secondaries (6)
('Burn pit / toxic exposure', 'Constrictive bronchiolitis', 'strong', 'Inhalation of burn pit particulates causes chronic inflammation and fibrosis of the small airways. PACT Act presumptive for covered veterans.', 'PACT Act 2022; 38 USC 1116B'),
('Burn pit / toxic exposure', 'Asthma', 'strong', 'Burn pit particulates trigger chronic airway inflammation and hyperreactivity. PACT Act presumptive condition for post-9/11 veterans.', 'PACT Act 2022; presumptive — no nexus needed'),
('Burn pit / toxic exposure', 'Chronic sinusitis / rhinitis', 'strong', 'Inhaled irritants cause chronic upper airway inflammation. Among the most commonly granted PACT Act presumptive conditions.', 'PACT Act 2022; presumptive'),
('Burn pit / toxic exposure', 'Lung cancer', 'strong', 'Burn pits produced carcinogenic compounds including dioxins, benzene, and volatile organic compounds linked to pulmonary malignancies.', 'PACT Act 2022; presumptive for covered cancers'),
('Burn pit / toxic exposure', 'Skin conditions (chloracne, dermatitis)', 'moderate', 'Direct contact with burn pit residue and airborne chemical irritants causes chronic dermatological conditions.', 'PACT Act; also Agent Orange presumptive for chloracne'),
('Burn pit / toxic exposure', 'Head/neck cancers', 'moderate', 'Upper aerodigestive tract directly exposed to inhaled carcinogens from burn pits. Multiple cancer types now PACT Act presumptive.', 'PACT Act 2022; specific cancer list'),

-- Flat feet secondaries (5)
('Flat feet (pes planus)', 'Plantar fasciitis', 'strong', 'Collapsed arches dramatically increase stress on the plantar fascia with every step. Flat feet are the single most common cause of plantar fasciitis.', 'Podiatric literature; commonly granted'),
('Flat feet (pes planus)', 'Knee condition — bilateral', 'moderate', 'Flat feet alter the biomechanical alignment of the lower leg, creating abnormal rotational forces on the knee joints during weight bearing.', 'Biomechanical nexus; kinetic chain'),
('Flat feet (pes planus)', 'Hip condition — bilateral', 'moderate', 'Altered foot mechanics from pes planus propagate upward through the kinetic chain, creating compensatory hip joint stress.', 'Kinetic chain theory; orthopedic nexus'),
('Flat feet (pes planus)', 'Lumbar strain', 'moderate', 'Flat feet alter the entire lower body biomechanical chain — abnormal gait patterns from collapsed arches transfer stress to the lumbar spine.', 'Podiatric/orthopedic nexus'),
('Flat feet (pes planus)', 'Achilles tendinitis', 'moderate', 'Overpronation from flat feet places abnormal strain on the Achilles tendon, leading to chronic tendinitis.', 'Podiatric nexus'),

-- Hypertension secondaries (2)
('Hypertension', 'Erectile dysfunction', 'moderate', 'Hypertension damages arterial walls throughout the body. Antihypertensive medications (especially beta-blockers and diuretics) directly cause ED.', 'SMC-K eligible; medication side effect nexus'),
('Hypertension', 'Chronic kidney disease', 'moderate', 'Sustained high blood pressure damages the glomerular capillaries in the kidneys, leading to progressive nephropathy.', '38 CFR 4.115; renal conditions'),

-- Rhinitis/sinusitis secondaries (2)
('Rhinitis / sinusitis', 'Sleep apnea', 'strong', 'Chronic nasal obstruction forces mouth breathing during sleep, collapsing the upper airway. Rhinitis is a well-established contributing factor to obstructive sleep apnea.', 'ENT/pulmonology nexus; BVA grants'),
('Rhinitis / sinusitis', 'Asthma', 'moderate', 'Chronic upper airway inflammation from rhinitis/sinusitis extends to the lower airways through the unified airway model, triggering or worsening asthma.', 'Unified airway theory; pulmonology nexus'),

-- Depression secondaries (3)
('Depression', 'Sleep apnea', 'moderate', 'Depression disrupts sleep architecture and neuromuscular control during sleep, contributing to obstructive sleep apnea development.', 'Sleep medicine research; BVA grants'),
('Depression', 'Erectile dysfunction', 'moderate', 'Depression itself impairs sexual function through neurochemical pathways. Antidepressants (SSRIs, SNRIs) have ED as a documented side effect.', 'SMC-K eligible; medication nexus'),
('Depression', 'Weight gain / obesity complications', 'possible', 'Antidepressant medications and depression-related behavioral changes cause significant weight gain, contributing to metabolic syndrome.', 'Medication side effect; indirect connection'),

-- Shoulder secondaries (2)
('Shoulder condition', 'Cervical strain', 'moderate', 'Chronic shoulder pain and limited range of motion cause compensatory cervical spine mechanics, accelerating degenerative changes in the neck.', 'Orthopedic nexus; compensation theory'),
('Shoulder condition', 'Peripheral neuropathy — upper extremity', 'moderate', 'Shoulder pathology (especially rotator cuff tears) can compress or irritate the brachial plexus, causing nerve symptoms in the arm.', '38 CFR 4.124a; thoracic outlet/brachial plexus'),

-- Migraine secondaries (2)
('Migraines', 'Depression', 'moderate', 'Chronic migraines significantly impair quality of life and are independently associated with major depressive disorder through shared serotonin pathway dysfunction.', 'Neurology research; comorbidity studies'),
('Migraines', 'Anxiety disorder', 'moderate', 'The unpredictability and severity of chronic migraines trigger anticipatory anxiety. Migraine and anxiety share common neurobiological substrates.', 'Neurology/psychiatry nexus');
