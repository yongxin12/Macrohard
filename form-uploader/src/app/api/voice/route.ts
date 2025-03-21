import {GoogleGenerativeAI} from "@google/generative-ai";
import {NextResponse} from "next/server";


export async function GET(request: Request) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    if (!apiKey) {
        return NextResponse.json({error: "GEMINI_API_KEY not set"}, {status: 500});
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({model: modelName});
        const {searchParams} = new URL(request.url);
        const transcript = searchParams.get('transcript');
        const type=searchParams.get('type');
        console.log(type);
        console.log(transcript);
        if (!transcript) {
            return NextResponse.json({error: "transcript parameter missing"}, {status: 400});
        }
        let prompt="";
        if (type === 'sf256') {
            prompt = `Analyze the following text and return a JSON object with the requested fields. If a field cannot be determined from the text, leave it blank.  Use only the fields specified below.

Text: ${transcript}

{
  "firstname": "",
  "lastname": "",
  "dateofbirth": DD-MM-YYYY,
  "ssn": "",
  "typeofdisability": "",
  "disabilitycode": ""
}

Disability Code Reference:
02- Developmental Disability, for example, autism spectrum disorder
03- Traumatic Brain Injury
19- Deaf or serious difficulty hearing, benefiting from, for example, American Sign Language, CART, hearing aids, a cochlear implant and/or other supports
20- Blind or serious difficulty seeing even when wearing glasses
31- Missing extremities (arm, leg, hand and/or foot)
40- Significant mobility impairment, benefiting from the utilization of a wheelchair, scooter, walker, leg brace(s) and/or other supports
60- Partial or complete paralysis (any cause)
82- Epilepsy or other seizure disorders
90- Intellectual disability
91- Significant Psychiatric Disorder, for example, bipolar disorder, schizophrenia, PTSD, or major depression
92- Dwarfism
93- Significant disfigurement, for example, disfigurements caused by burns, wounds, accidents, or congenital disorders
01- I do not wish to identify my disability or serious health condition.
05- I do not have a disability or serious health condition.
06- I have a disability or serious health condition, but it is not listed on this form.
13- Speech impairment
41- Spinal abnormalities, for example, spina bifida or scoliosis
44- Non-paralytic orthopedic impairments, for example, chronic pain, stiffness, weakness in bones or joints, some loss of ability to use part or parts of the body
51- HIV Positive/AIDS
52- Morbid obesity
59- Nervous system disorder for example, migraine headaches, Parkinson’s disease, or multiple sclerosis
80- Cardiovascular or heart disease
81- Depression, anxiety disorder, or other psychiatric disorder
83- Blood diseases, for example, sickle cell anemia, hemophilia
84- Diabetes
85- Orthopedic impairments or osteo-arthritis
86- Pulmonary or respiratory conditions, for example, tuberculosis, asthma, emphysema
87- Kidney dysfunction
88- Cancer (present or past history)
94- Learning disability or attention deficit/hyperactivity disorder (ADD/ADHD)
95- Gastrointestinal disorders, for example, Crohn's Disease, irritable bowel syndrome, colitis, celiac disease, dysphexia
96- Autoimmune disorder, for example, lupus, fibromyalgia, rheumatoid arthritis
97- Liver disease, for example, hepatitis or cirrhosis
98- History of alcoholism or history of drug addiction (but not currently using illegal drugs)
99- Endocrine disorder, for example, thyroid dysfunction`;
        }
        try {
            const result = await model.generateContent(prompt);
            const text = await result.response.text(); // Fixed: await text()
            const jsonRegex = /```json\s*([\s\S]*?)```/;
            const match = text.match(jsonRegex);

            if (match) {
                const jsonString = match[1].trim();
                try {
                    const jsonObject = JSON.parse(jsonString);
                    console.log(jsonObject);
                    return NextResponse.json(jsonObject);
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                }
            } else {
                console.error("No JSON block found in the markdown file.");
                return NextResponse.json({error: "No JSON block found in the markdown file."}, {status: 500});
            }
        } catch (error) {
            console.error("Error:", error);
            return NextResponse.json({error: "Gemini API request failed", detail: error.message}, {status: 500});
        }
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({error: "API initialization failed"}, {status: 500});
    }
}