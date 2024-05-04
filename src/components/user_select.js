import React, { useMemo, useRef, useState } from 'react';
import { Select, Spin } from 'antd';
import debounce from 'lodash/debounce';
import { user } from '@/api/index';

export default function UserSelect({ debounceTimeout = 800, userFilter = {}, sort = {}, ...props }) {
    const [fetching, setFetching] = useState(false);
    const [options, setOptions] = useState([]);
    const fetchRef = useRef(0);
    const debounceFetcher = useMemo(() => {
        const loadOptions = (value) => {
            fetchRef.current += 1;
            const fetchId = fetchRef.current;
            setOptions([]);
            setFetching(true);
            user.getUserList({
                ...userFilter,
                kw: value,
                current: 1,
                pageSize: 10
            }, sort).then((result) => {
                const data = result.data;
                if (fetchId !== fetchRef.current) {
                    // for fetch callback order
                    return;
                }
                setOptions(
                    data.map((item) => ({
                        label: `${item.name}(${item.employee_id})`,
                        value: item.id,
                    }))
                );
                setFetching(false);
            });
        };
        return debounce(loadOptions, debounceTimeout);
    }, [userFilter, debounceTimeout, sort]);


    return (
        <Select
            labelInValue
            filterOption={false}
            onSearch={debounceFetcher}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            {...props}
            options={options}
        />
    );
}

