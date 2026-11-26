import { describe, expect, it } from 'vitest';
import { branchHoursDefaults, branchHoursPayload, branchHoursSchema } from './branch-hours';

const timedHours = () => {
	const data = branchHoursDefaults('Africa/Lagos');
	Object.assign(data.days[0], { is_enabled: true, open_time: '08:00', close_time: '17:00' });
	return data;
};

describe('branch operating hours', () => {
	it('accepts closed, timed, all-day and overnight days', () => {
		const data = timedHours();
		Object.assign(data.days[1], { is_enabled: true, all_day: true });
		Object.assign(data.days[2], { is_enabled: true, open_time: '22:00', close_time: '06:00' });
		expect(branchHoursSchema.safeParse(data).success).toBe(true);
	});

	it('requires all seven unique weekdays', () => {
		const data = timedHours();
		data.days[6].week_day = 0;
		expect(branchHoursSchema.safeParse(data).success).toBe(false);
		data.days.pop();
		expect(branchHoursSchema.safeParse(data).success).toBe(false);
	});

	it('rejects missing and invalid times on enabled timed days', () => {
		for (const open_time of [null, '', '25:00', '8:00', '12:60']) {
			const data = timedHours();
			data.days[0].open_time = open_time;
			expect(branchHoursSchema.safeParse(data).success).toBe(false);
		}
	});

	it('rejects equal times instead of interpreting them as all day', () => {
		const data = timedHours();
		data.days[0].close_time = '08:00';
		expect(branchHoursSchema.safeParse(data).success).toBe(false);
	});

	it('rejects unknown timezones', () => {
		const data = timedHours();
		data.timezone = 'Unknown/Nowhere';
		expect(branchHoursSchema.safeParse(data).success).toBe(false);
	});

	it('normalizes legacy saved hours without mutating them', () => {
		const hours = {
			days: [{ week_day: 2, is_enabled: true, open_time: '09:00', close_time: '17:00' }],
			is_emergency_services: true
		};
		const data = branchHoursDefaults('Africa/Lagos', hours);
		expect(data.days).toHaveLength(7);
		expect(data.days[2]).toMatchObject({ week_day: 2, all_day: false, open_time: '09:00' });
		data.days[2].open_time = '10:00';
		expect(hours.days[0].open_time).toBe('09:00');
	});

	it('omits clock times for closed and all-day payloads and keeps emergency metadata separate', () => {
		const data = timedHours();
		Object.assign(data.days[1], {
			is_enabled: true,
			all_day: true,
			open_time: '08:00',
			close_time: '17:00'
		});
		Object.assign(data.days[2], { all_day: true, open_time: '08:00', close_time: '17:00' });
		data.is_emergency_services = true;
		const payload = branchHoursPayload(data);
		expect(payload.operating_hours.days[0]).toMatchObject({
			open_time: '08:00',
			close_time: '17:00'
		});
		expect(payload.operating_hours.days[1]).not.toHaveProperty('open_time');
		expect(payload.operating_hours.days[1]).not.toHaveProperty('close_time');
		expect(payload.operating_hours.days[2]).toEqual({
			week_day: 2,
			is_enabled: false,
			all_day: false
		});
		expect(payload.operating_hours.is_emergency_services).toBe(true);
		expect(payload.operating_hours.days[6].is_enabled).toBe(false);
	});
});
