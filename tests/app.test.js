import request from 'supertest';
import { server } from '../index.js';
import app from '../index.js';

const movieProviders = ['2embed', 'vidsrcsu'];

describe('API Routes', () => {
    describe('GET /', () => {
        it('should return welcome message', async () => {
            const res = await request(app).get('/');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('INTRO');
        });
    });

    describe('Movie Routes', () => {
        movieProviders.forEach(provider => {
            it(`should work with ${provider} provider`, async () => {
                const testId = 533535;
                const res = await request(app).get(`/movie/${provider}/${testId}`);
                expect([200, 404]).toContain(res.statusCode);
                if (res.statusCode === 200) {
                    res.body.forEach(sourceItem => {
                        expect(sourceItem).toHaveProperty('source');
                        expect(sourceItem.source).toHaveProperty('files');
                        expect(sourceItem.source.files).toBeInstanceOf(Array);
                        expect(sourceItem.source.files.length).toBeGreaterThan(0);
                    });
                }
            });
        });
    });

    describe('TV Show Routes', () => {
        movieProviders.forEach(provider => {
            it(`should work with ${provider} provider`, async () => {
                const testId = 93405;
                const res = await request(app)
                    .get(`/tv/${provider}/${testId}`)
                    .query({ s: 1, e: 1 });
                expect([200, 404]).toContain(res.statusCode);
                if (res.statusCode === 200) {
                    res.body.forEach(sourceItem => {
                        expect(sourceItem).toHaveProperty('source');
                        expect(sourceItem.source).toHaveProperty('files');
                        expect(sourceItem.source.files).toBeInstanceOf(Array);
                        expect(sourceItem.source.files.length).toBeGreaterThan(0);
                    });
                }
            });
        });
    });

    describe('Error Handling', () => {
        it('GET /nonexistent - should return 404', async () => {
            const res = await request(app).get('/nonexistent');
            expect(res.statusCode).toEqual(404);
        });

        it('GET /movie/ - should return 405', async () => {
            const res = await request(app).get('/movie/');
            expect(res.statusCode).toEqual(405);
        });

        it('GET /tv/ - should return 405', async () => {
            const res = await request(app).get('/tv/');
            expect(res.statusCode).toEqual(405);
        });
    });

    afterAll(async () => {
        await new Promise(resolve => server.close(resolve));
    });
});