/*
 * @Author: Richard yuetingpei888@gmail.com
 * @Date: 2025-03-20 01:11:06
 * @LastEditors: Richard yuetingpei888@gmail.com
 * @LastEditTime: 2025-03-20 01:48:39
 * @FilePath: /Macrohard/disability-job-finder/src/models/JobSeeker.ts
 * @Description: 
 * 
 */
import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IJobSeeker extends Document {
  name: string;
  email: string;
  phone?: string;
  disabilityType?: string;
  accommodations?: string[];
  skills?: string[];
  experience?: string;
  education?: string;
  preferredJobs?: string[];
  location?: string;
  createdAt: Date;
  updatedAt: Date;
  source: 'voice' | 'document';
  rawText?: string;
}

const JobSeekerSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    disabilityType: { type: String },
    accommodations: [{ type: String }],
    skills: [{ type: String }],
    experience: { type: String },
    education: { type: String },
    preferredJobs: [{ type: String }],
    location: { type: String },
    source: { 
      type: String, 
      enum: ['voice', 'document'], 
      required: true 
    },
    rawText: { type: String }
  },
  { timestamps: true }
);

export default models.JobSeeker || model<IJobSeeker>('JobSeeker', JobSeekerSchema); 