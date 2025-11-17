// Mock data service voor design mode
// Dit voorkomt dat designers een backend nodig hebben

export const mockData = {
  jobs: [
    { id: 1, title: "Senior Frontend Developer", company: "TechCorp", location: "Amsterdam" },
    { id: 2, title: "UX Designer", company: "DesignStudio", location: "Rotterdam" },
    // Add more mock data as needed
  ],
  users: {
    current: {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "freelancer"
    }
  }
};

export const mockApi = {
  get: (endpoint: string) => Promise.resolve(mockData),
  post: (endpoint: string, data: any) => Promise.resolve({ success: true, data }),
  put: (endpoint: string, data: any) => Promise.resolve({ success: true, data }),
  delete: (endpoint: string) => Promise.resolve({ success: true })
};
