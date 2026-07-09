export interface CreateCampaignPayload {
  name:          string;
  domain:        string;
  description:   string;
  campaign_type: string;
  status:        string;
  is_draft?:     boolean;
  start_date:    string;
  end_date:      string;
  keywords:      string[];
  references:    string[];
  githubLink?:        string | null;
  driveLink?:         string | null;
  contractDurationMonths?: number | null;
}

export interface CampaignLookupResponse {
  data: unknown[];
}
