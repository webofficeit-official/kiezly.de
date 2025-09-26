export interface Job {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category_id: number | null;
  price_type: string;
  price_value_min: string;
  price_value_max: string;
  currency: string;
  country: string;
  state: string;
  city: string;
  postal_code: string;
  street: string;
  lat: string;
  lng: string;
  starts_at: string; // ISO date
  ends_at: string;   // ISO date
  job_experience: string;
  job_type: string;
  first_aid_verified: boolean;
  police_verified: boolean;
  verified: boolean;
}
export interface CreateJobData {
  title: string;
  subtitle: string;
  description: string;
  category_id: number;              
  tag_ids: number[];                
  price_type: string;   
  price_min: number;               
  price_max: number;                
  currency: string;
  country: string;
  state: string;
  city: string;
  postal_code: string;
  street: string;
  lat: string;                      
  lng: string;
  starts_at: string;                
  ends_at: string;                  
  job_type: string[];               
  job_experience: string[];         
  first_aid_verified: boolean;
  police_verified: boolean;
  verified?:boolean;
  status: "open" | "closed" | "draft"; 
}



export interface CreateJobResponse {
  status: boolean;
  message: string;
  data: Job;
}

export interface JobResponse {
  status: boolean;
  message: string;
  job: Job;
}


export interface JobCategory {
  id: number;
  name: string;
}

export interface JobTag {
  id: number;
  name: string;
}


export interface JobCollections {
  jobType: string[];         
  jobExperience: string[];   
  jobCategories: JobCategory[];
  jobTags: JobTag[];
}

export interface JobCollectionsResponse {
  success: boolean;
  message: string;
  data: JobCollections;
}


export interface JobList {
  id: string;
  client_id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string; // HTML string
  category_id: number;
  category_name: string;
  price_type: string;
  price_value: string; // backend has this too
  price_min: string;
  price_max: string;
  currency: string;
  status: string;
  country: string;
  state: string;
  city: string;
  postal_code: string;
  street: string;
  lat: number;
  lng: number;
  starts_at: string;   // ISO datetime
  ends_at: string;     // ISO datetime
  created_at: string;  // ISO datetime
  updated_at: string;  // ISO datetime
  geom: string;
  job_type: string[];        // array in response
  job_experience: string[];  // array in response
  first_aid_verified: boolean;
  police_verified: boolean;
  verified: boolean;
  distance?:number;
  tags: {
    id: number;
    slug: string;
    name: string;
  }[];
}


export type JobApiResponse = {
  status: boolean;
  message: string;
  data: {
    items: JobList[];
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
};