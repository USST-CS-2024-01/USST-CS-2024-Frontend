import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Select, Spin } from 'antd';
import debounce from 'lodash/debounce';
import { clazz } from '@/api/index';

export default function ClassMemberSelect({ debounceTimeout = 800, classId, groupId = null, returnType = 'memberId', defaultValue = null, ...props }) {
    const [fetching, setFetching] = useState(false);
    const [options, setOptions] = useState([]);
    const fetchRef = useRef(0);
    const debounceFetcher = useMemo(() => {
        const loadOptions = (value) => {
            fetchRef.current += 1;
            const fetchId = fetchRef.current;
            setOptions([]);
            setFetching(true);
            clazz.getClassMember(classId).then((result) => {
                const data = result.data;
                if (fetchId !== fetchRef.current) {
                    // for fetch callback order
                    return;
                }
                setOptions(
                    data
                        .filter((item) => item.is_teacher === false)
                        .filter((item) => !groupId || item.group_id === groupId)
                        .map((item) => ({
                            label: `${item?.user?.name}(${item?.user?.employee_id})`,
                            value: returnType === 'memberId' ? item.id : item?.user?.id
                        }))
                );
                setFetching(false);
            });
        };
        return debounce(loadOptions, debounceTimeout);
    }, [classId, debounceTimeout, groupId, returnType]);


    useEffect(() => {
        if (defaultValue) {
            setOptions((options) => {
                if (options.length === 0) {
                    return options;
                }
                return options.concat({
                    label: `${defaultValue?.name}(${defaultValue?.employee_id})`,
                    value: returnType === 'memberId' ? defaultValue.id : defaultValue.user_id
                })
            })
        }
    }, [defaultValue, returnType])

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

