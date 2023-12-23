'use client';
import React, { useEffect, useRef, useState } from 'react';

function convertPercentageToExponential(percentage: number) {
  if (percentage < 70) {
    // For percentages less than 70%, use a quadratic function that grows slower than linearly.
    return Math.max(10, Math.pow(percentage, 2) / 140); // Adjusted the denominator for a slower growth
  } else if (percentage > 70 && percentage < 100) {
    // For percentages between 70% and 100%, use a quadratic function that grows faster than linearly.
    // Adjust the coefficient to ensure the output is greater than the input.
    return 70 + Math.pow(percentage - 70, 2) / 30; // Adjusted the coefficient for faster growth
  } else {
    // For 70% and 100%, return the value as is.
    return percentage;
  }
}

const generateRandomCMYKValues = (): {
  c: number;
  m: number;
  y: number;
  k: number;
}[] => {
  const cmykValues: { c: number; m: number; y: number; k: number }[] =
    [];

  for (let i = 0; i < 100; i++) {
    const c = Math.floor(Math.random() * 100);
    const m = Math.floor(Math.random() * 100);
    const y = Math.floor(Math.random() * 100);
    const k = Math.floor(Math.random() * 100);

    const cmykValue = { c, m, y, k };
    cmykValues.push(cmykValue);
  }

  return cmykValues;
};

const convertCMYKToHex = (
  c: number,
  m: number,
  y: number,
  k: number
): string => {
  const r = Math.round(255 * (1 - c / 100) * (1 - k / 100));
  const g = Math.round(255 * (1 - m / 100) * (1 - k / 100));
  const b = Math.round(255 * (1 - y / 100) * (1 - k / 100));

  const hex = `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  return hex;
};

type Color = {
  c: number;
  m: number;
  y: number;
  k: number;
};

const Customer: React.FC<{
  customer: Color;
  paint: { c: number; m: number; y: number; k: number }[];
}> = ({ customer }) => (
  <div className="flex flex-row gap-2">
    <div>Customer wants</div>
    <div
      style={{
        backgroundColor: convertCMYKToHex(
          customer.c,
          customer.m,
          customer.y,
          customer.k
        ),
        color: 'white',
      }}
    >
      {`cmyk(${customer.c}, ${customer.m}, ${customer.y}, ${customer.k})`}
    </div>
  </div>
);

const generateBlackCMYKValues = (): {
  c: number;
  m: number;
  y: number;
  k: number;
}[] => {
  const blackCMYKValues: {
    c: number;
    m: number;
    y: number;
    k: number;
  }[] = [];

  for (let i = 0; i < 50; i++) {
    const c = 0;
    const m = 0;
    const y = 0;
    const k = 100;

    const blackCMYKValue = { c, m, y, k };
    blackCMYKValues.push(blackCMYKValue);
  }

  return blackCMYKValues;
};

const TwoColumnComponent = () => {
  const [money, setMoney] = useState(20);
  const [purchaseHistory, setPurchaseHistory] = useState<
    {
      type: 'internal' | 'external';
      customer: Color;
      paint: Color;
      money: number;
      balance: number;
    }[]
  >([]);
  const [customers, setCustomers] = useState<
    { c: number; m: number; y: number; k: number }[]
  >(generateRandomCMYKValues());

  const [generators, setGenerators] = useState<Color[]>([
    {
      c: 0,
      m: 0,
      y: 0,
      k: 100,
    },
  ]);

  const [paints, setPaints] = useState<
    { c: number; m: number; y: number; k: number }[]
  >([]);

  const timeRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      timeRef.current = timeRef.current + 1;
      // if (timeRef.current > 15) {
      //   return;
      // }
      let myPaints = paints;
      let myPurchaseHistory = purchaseHistory;
      let myMoney = money;
      let myCustomers = customers;

      if (timeRef.current == 1 || timeRef.current % 12 === 0) {
        for (const generator of generators) {
          if (
            Object.values(generator).filter((value) => value !== 0)
              .length > 1
          ) {
            let myGenerator = generator;
            let lastLeft = undefined;
            let tempMyPurchaseHistory = myPurchaseHistory;
            let tempMyPaints = myPaints;
            let tempMyMoney = myMoney;
            while (true) {
              debugger;
              const closestPaint = getBestPaint(
                tempMyPaints,
                myGenerator
              );
              if (lastLeft === closestPaint.bestLeft) {
                // we never found a full match, fail
                // dont add it to the list
                break;
              }
              const purchaseMoney = 0;
              tempMyMoney = tempMyMoney - purchaseMoney;
              tempMyPurchaseHistory = [
                ...tempMyPurchaseHistory,
                {
                  type: 'internal',
                  customer: generator,
                  paint: tempMyPaints[closestPaint.index],
                  money: purchaseMoney,
                  balance: tempMyMoney,
                },
              ];

              tempMyPaints = [
                ...tempMyPaints.slice(0, closestPaint.index),
                ...tempMyPaints.slice(closestPaint.index + 1),
              ];

              myGenerator = closestPaint.remaining as Color;
              if (closestPaint.bestLeft === 0) {
                // none left, so stop
                // add it now
                myPaints = tempMyPaints;
                myPurchaseHistory = tempMyPurchaseHistory;
                myMoney = tempMyMoney;
                myPaints.unshift(generator);
                break;
              }
              lastLeft = closestPaint.bestLeft;
            }
            // do while we are still consuming paints
            // more than 1 of the values of the generator is non zero
          } else {
            const purchaseMoney = 0;
            myPaints.unshift(generator);
            myMoney = myMoney - purchaseMoney;
            myPurchaseHistory = [
              ...myPurchaseHistory,
              {
                type: 'internal',
                customer: generator,
                paint: generator,
                money: purchaseMoney,
                balance: myMoney,
              },
            ];
          }
        }
      }

      if (
        myPaints.length > 10
          ? timeRef.current % 1 == 0
          : myPaints.length > 5
          ? timeRef.current % 2 == 0
          : timeRef.current % 5 === 0
      ) {
        for (const customer of myCustomers) {
          if (myPaints.length === 0) {
            myCustomers = myCustomers.slice(1);
            break;
          }
          const closestPaint = getBestPaint(myPaints, customer);

          const purchaseMoney =
            (10 *
              convertPercentageToExponential(
                closestPaint.percent * 100
              )) /
            100;
          myMoney = myMoney + purchaseMoney;
          myPurchaseHistory = [
            ...myPurchaseHistory,
            {
              type: 'external',
              customer,
              paint: myPaints[closestPaint.index],
              money: purchaseMoney,
              balance: myMoney,
            },
          ];

          myPaints = [
            ...myPaints.slice(0, closestPaint.index),
            ...myPaints.slice(closestPaint.index + 1),
          ];

          myCustomers = myCustomers.slice(1);

          // only do the first customer now
          break;
        }
        debugger;
        // const disposalFee = 1;
        // if (myPaints.length > 10) {
        //   myMoney = myMoney - disposalFee;
        //   myPaints.slice(0, 10);
        // }
      }
      if (myCustomers.length === 0) {
        myCustomers = generateRandomCMYKValues();
      }
      setCustomers(myCustomers);
      if (myPaints.length > 15) {
        myMoney = myMoney / 2;
        myPaints = [];
      }
      setPaints(myPaints);
      setPurchaseHistory(myPurchaseHistory);
      setMoney(myMoney);

      // const generatorCount = generators.length;
      // console.log(`Number of generators: ${generatorCount}`);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [customers, generators, money, paints, purchaseHistory]);

  return (
    <div className="flex h-full">
      <div className="w-1/2 h-full overflow-y-scroll flex flex-col gap-5">
        <div className="text-2xl font-bold">${money.toFixed(2)}</div>
        <div>
          <h2 className="text-3xl font-bold">Paint Factory</h2>

          <div>
            <input
              type="text"
              disabled={money < 20}
              placeholder="c,m,y,k"
              className="text-black"
            />
            <button
              disabled={money < 20}
              onClick={() => {
                setMoney(money - 20);
                const inputValues = document
                  .querySelector('input')
                  ?.value.split(',');
                if (inputValues?.length === 4) {
                  const [c, m, y, k] = inputValues.map(Number);
                  const newGenerator = { c, m, y, k };
                  setGenerators([...generators, newGenerator]);
                }
              }}
              className="bg-blue-500 text-white px-1 py-0 rounded"
            >
              buy $20 generator
            </button>
          </div>
          {generators.map((generator, index) => (
            <div key={index} className="flex flex-row gap-2">
              <button
                onClick={() => {
                  const updatedGenerators = generators.filter(
                    (_, i) => i !== index
                  );
                  setGenerators(updatedGenerators);
                }}
              >
                remove
              </button>
              {Object.values(generator).filter((v) => v !== 0)
                .length !== 1
                ? ' Takes '
                : ''}
              {Object.entries(generator).map(
                ([key, value], index) => {
                  if (
                    Object.values(generator).filter((v) => v !== 0)
                      .length === 1
                  ) {
                    return null;
                  }
                  if (value === 0) {
                    return null;
                  }
                  const temp = {
                    c: 0,
                    m: 0,
                    y: 0,
                    k: 0,
                    ...{ [key]: 100 },
                  };
                  return (
                    <>
                      1 x
                      <div
                        key={`${JSON.stringify(
                          generator
                        )}-${key}->${value}`}
                        className="h-5 w-5 border-2 border-white"
                        style={{
                          backgroundColor: convertCMYKToHex(
                            temp.c,
                            temp.m,
                            temp.y,
                            temp.k
                          ),
                          color: 'white',
                        }}
                      ></div>{' '}
                    </>
                  );
                }
              )}
              {Object.values(generator).filter((v) => v !== 0)
                .length !== 1
                ? 'and makes'
                : ''}
              <div
                className="h-5 w-5 border-2 border-white"
                style={{
                  backgroundColor: convertCMYKToHex(
                    generator.c,
                    generator.m,
                    generator.y,
                    generator.k
                  ),
                  color: 'white',
                }}
              ></div>
              cmyk({generator.c}, {generator.m}, {generator.y},{' '}
              {generator.k})
            </div>
          ))}
          {/* Content for the first column */}

          <div>
            <h2 className="text-3xl font-bold">Generation History</h2>
            {[...purchaseHistory]
              .reverse()
              .filter((p) => p.type === 'internal')
              .slice(0, 20)
              .map((purchaseHistory, index) => (
                <div key={index} className="flex flex-row gap-2">
                  {purchaseHistory.type === 'internal'
                    ? 'paint'
                    : 'customer'}
                  <div
                    style={{
                      backgroundColor: convertCMYKToHex(
                        purchaseHistory.customer.c,
                        purchaseHistory.customer.m,
                        purchaseHistory.customer.y,
                        purchaseHistory.customer.k
                      ),
                      color: 'white',
                    }}
                  >
                    cmyk({purchaseHistory.customer.c},{' '}
                    {purchaseHistory.customer.m},{' '}
                    {purchaseHistory.customer.y},{' '}
                    {purchaseHistory.customer.k})
                  </div>
                  {purchaseHistory.type === 'internal'
                    ? 'was made from'
                    : 'bought'}
                  <div
                    style={{
                      backgroundColor: convertCMYKToHex(
                        purchaseHistory.paint.c,
                        purchaseHistory.paint.m,
                        purchaseHistory.paint.y,
                        purchaseHistory.paint.k
                      ),
                      color: 'white',
                    }}
                  >
                    cmyk({purchaseHistory.paint.c},{' '}
                    {purchaseHistory.paint.m},{' '}
                    {purchaseHistory.paint.y},{' '}
                    {purchaseHistory.paint.k})
                  </div>
                  <div>for ${purchaseHistory.money.toFixed(2)}</div>
                  <div>
                    , ${purchaseHistory.balance.toFixed(2)} balance
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold">Paint Store</h2>
          {paints.length} paints for sale
          <div className="flex flex-row gap-2 flex-wrap">
            {paints.map((paint, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: convertCMYKToHex(
                    paint.c,
                    paint.m,
                    paint.y,
                    paint.k
                  ),
                  color: 'white',
                }}
                className="h-5 w-5 border-2 border-white"
              ></div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold">Purchase History</h2>
          {[...purchaseHistory]
            .reverse()
            .filter((p) => p.type === 'external')
            .slice(0, 30)
            .map((purchaseHistory, index) => (
              <div key={index} className="flex flex-row gap-2">
                {purchaseHistory.type === 'internal'
                  ? 'paint'
                  : 'customer'}
                <div
                  style={{
                    backgroundColor: convertCMYKToHex(
                      purchaseHistory.customer.c,
                      purchaseHistory.customer.m,
                      purchaseHistory.customer.y,
                      purchaseHistory.customer.k
                    ),
                    color: 'white',
                  }}
                >
                  cmyk({purchaseHistory.customer.c},{' '}
                  {purchaseHistory.customer.m},{' '}
                  {purchaseHistory.customer.y},{' '}
                  {purchaseHistory.customer.k})
                </div>
                {purchaseHistory.type === 'internal'
                  ? 'was made from'
                  : 'bought'}
                <div
                  style={{
                    backgroundColor: convertCMYKToHex(
                      purchaseHistory.paint.c,
                      purchaseHistory.paint.m,
                      purchaseHistory.paint.y,
                      purchaseHistory.paint.k
                    ),
                    color: 'white',
                  }}
                >
                  cmyk({purchaseHistory.paint.c},{' '}
                  {purchaseHistory.paint.m}, {purchaseHistory.paint.y}
                  , {purchaseHistory.paint.k})
                </div>
                <div>for ${purchaseHistory.money.toFixed(2)}</div>
                <div>
                  , ${purchaseHistory.balance.toFixed(2)} balance
                </div>
              </div>
            ))}
        </div>

        {/* Content for the first column */}
      </div>
      <div className="w-1/2 h-full overflow-y-scroll flex flex-col gap-5">
        <div>
          <h2 className="text-3xl font-bold">Customer Queue</h2>
          <ul>
            <li>
              Customers wait 5 seconds for paint if there is none,
              they leave.
            </li>
            <li>Customers will only buy 1 can of paint</li>
            <li>
              Customers customers buy the closest color they can get
            </li>
            <li>
              Customers customers pay more the closer the color is
            </li>
            <li>
              Make more paints colors by buying paint generators
            </li>
          </ul>
        </div>

        <div>
          {customers.map((customer, index) => (
            <Customer
              key={index}
              customer={customer}
              paint={paints}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
export default TwoColumnComponent;
function getBestPaint(
  paint: { c: number; m: number; y: number; k: number }[],
  customer: { c: number; m: number; y: number; k: number }
) {
  return paint.reduce(
    (acc, p, index) => {
      const starting =
        customer.c + customer.m + customer.y + customer.k;

      // does the paint have colors not in the customers
      // if so we want use it
      if (
        Object.entries(p).filter(
          ([key, value]) =>
            value !== 0 && customer[key as keyof Color] === 0
        ).length > 0
      ) {
        return acc;
      }
      // for the paint, find the smallest amount that matches the customer
      const value = Object.entries(p).reduce((acc, [key, value]) => {
        if (value === 0) {
          return acc;
        }
        const customerValue = customer[key as keyof Color];
        const max = Math.min(value, customerValue);
        if (max < acc) {
          return max;
        }
        return acc;
      }, Infinity);

      const remainingCMYK = {
        c: Math.max(customer.c - Math.min(p.c, value), 0),
        m: Math.max(customer.m - Math.min(p.m, value), 0),
        y: Math.max(customer.y - Math.min(p.y, value), 0),
        k: Math.max(customer.k - Math.min(p.k, value), 0),
      };
      // if there is more than 1 value of paint remaining
      // if (
      //   Object.values(remainingPaint).filter((v) => v !== 0).length >
      //   1
      // ) {
      //   return acc;
      // }
      const left =
        remainingCMYK.c +
        remainingCMYK.m +
        remainingCMYK.y +
        remainingCMYK.k;

      if (left < acc.bestLeft) {
        return {
          index,
          bestLeft: left,
          percent: (starting - left) / starting,
          remaining: remainingCMYK,
        };
      }
      return acc;
    },
    {
      index: 0,
      bestLeft: Infinity,
      percent: 0,
      remaining: undefined as undefined | Color,
    }
  );
}
