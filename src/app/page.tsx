'use client';
import React, { useEffect, useRef, useState } from 'react';

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
  const [money, setMoney] = useState(40);
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
              const purchaseMoney = 1;
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
            const purchaseMoney = 2;
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

      if (timeRef.current % 5 === 0) {
        for (const customer of customers) {
          if (myPaints.length === 0) {
            setCustomers(customers.slice(1));
            break;
          }
          const closestPaint = getBestPaint(myPaints, customer);

          const purchaseMoney = 10 * closestPaint.percent;
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

          setCustomers(customers.slice(1));

          // only do the first customer now
          break;
        }
        debugger;
        const disposalFee = 1;
        if (myPaints.length > 10) {
          myMoney = myMoney - disposalFee;
          myPaints.slice(0, 10);
        }
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
            >
              buy $20 generator
            </button>
          </div>

          {generators.map((generator, index) => (
            <div
              key={index}
              style={{
                backgroundColor: convertCMYKToHex(
                  generator.c,
                  generator.m,
                  generator.y,
                  generator.k
                ),
                color: 'white',
              }}
            >
              cmyk({generator.c}, {generator.m}, {generator.y},{' '}
              {generator.k})
            </div>
          ))}
          {/* Content for the first column */}
        </div>

        <div>
          <h2 className="text-3xl font-bold">Paint Store</h2>
          {paints.length} paints for sale
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
            >
              cmyk({paint.c}, {paint.m}, {paint.y}, {paint.k})
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-3xl font-bold">Purchase History</h2>
          {[...purchaseHistory]
            .reverse()
            .slice(0, 10)
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

      const remainingCMYK = {
        c: Math.max(customer.c - p.c, 0),
        m: Math.max(customer.m - p.m, 0),
        y: Math.max(customer.y - p.y, 0),
        k: Math.max(customer.k - p.k, 0),
      };
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
