export type ActionResponse = 
| {
    success: true;
    message?: string;
}
| {
    success: false;
    error: string;
};
