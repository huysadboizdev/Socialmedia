export interface SmmApiResponse {
    order?: number;
    error?: string;
    status?: string;
    charge?: string;
    remains?: string;
    currency?: string;
    [key: string]: string | number | undefined;
}

export const smmApiRequest = async (data: Record<string, string | number>): Promise<SmmApiResponse> => {
    const apiUrl = process.env.SMM_API_URL ?? 'https://apiv2.smm79.com/api/v2';
    const apiKey = process.env.SMM_API_KEY ?? '';

    if (!apiKey) {
        console.warn('SMM_API_KEY is not defined in environment variables');
    }

    const params = new URLSearchParams();
    params.append('key', apiKey);
    for (const d in data) {
        params.append(d, String(data[d]));
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });
        
        const result = (await response.json()) as SmmApiResponse;
        return result;
    } catch (error) {
        console.error('SMM API Request Error:', error);
        return { error: 'Failed to connect to API provider' } as SmmApiResponse;
    }
};

export const addSmmOrder = async (serviceId: string, link: string, quantity: number): Promise<SmmApiResponse> => {
    return smmApiRequest({
        action: 'add',
        service: serviceId,
        link: link,
        quantity: quantity
    });
};

export const checkSmmStatus = async (orderId: string): Promise<SmmApiResponse> => {
    return smmApiRequest({
        action: 'status',
        order: orderId
    });
};

export const checkSmmBalance = async (): Promise<SmmApiResponse> => {
    return smmApiRequest({
        action: 'balance'
    });
};
