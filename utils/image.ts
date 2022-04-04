import download from 'image-downloader';


export const downloadImage = async (url: string, dest: string) => {
    const options = {
        url,
        dest
    };

    const { filename } = await download.image({
        extractFilename: true,
        ...options
    });

    return filename;
}