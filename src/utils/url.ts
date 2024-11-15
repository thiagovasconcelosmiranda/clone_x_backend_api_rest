export const getPublicUrl = (url: string, dir: string, slug: string) => {
    return `${process.env.BASE_URL}/${dir}/${slug}/${url}`;
}