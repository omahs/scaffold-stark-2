"use client";

import { useProvider } from "@starknet-react/core";
import React, { useState } from "react";
import { useTargetNetwork } from "~~/hooks/scaffold-stark/useTargetNetwork";
import configExternalContracts from "~~/contracts/configExternalContracts";
import { deepMergeContracts } from "~~/utils/scaffold-stark/contract";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { notification } from "~~/utils/scaffold-stark";

export default function DownloadContracts() {
  const { provider } = useProvider();
  const [address, setAddress] = useState<string>("");

  const { targetNetwork } = useTargetNetwork();
  const [symbol, setSymbol] = useState<string>("");
  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.value;
    setSymbol(value);
  };

  const handleDownload = async () => {
    if (!address) return;
    try {
      const [apiResponse, classHash] = await Promise.all([
        provider.getClassAt(address),
        provider.getClassHashAt(address),
      ]);

      const contractData = {
        [targetNetwork.network]: {
          [symbol]: {
            address,
            classHash,
            abi: apiResponse.abi,
          },
        },
      };
      const mergedPredeployedContracts = deepMergeContracts(
        contractData,
        configExternalContracts
      );

      generateContractsFile(mergedPredeployedContracts);
    } catch (error) {
      console.error(error);
      return;
    }
  };

  const generateContractsFile = async (contractsData: Object) => {
    try {
      const response = await fetch("/api/configure-contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contractsData),
      });
      console.log(response.ok);
      if (!response.ok) {
        throw new Error("Failed to save contract");
      }
      notification.success("Contract saved successfully");
    } catch (error) {
      notification.error("Failed to save contract");
      console.error(error);
      return;
    }
  };

  return (
    <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
      <div className="p-6 px-8 mx-2 border-gradient rounded-[5px] w-full max-w-6xl contract-content">
        <div className="text-xl mb-2 font-bold">
          Fetch Contract Configuration File from Contract Address
        </div>
        <div className="flex flex-col gap-12 sm:gap-24 sm:flex-row">
          <div className="flex-1">
            <div className="font-bold my-3 text-lg">Instructions</div>
            <p className="my-2">
              This tool allows you to fetch the ABI of a contract by entering
              its address. It will download a configuration file that can be
              used to replace or append to your local{" "}
              <code className="text-function">configExternalContracts.ts</code>{" "}
              file, allowing you to debug in the{" "}
              <code className="text-function">/debug</code> page.
            </p>
            <ol className="flex flex-col gap-2 list-decimal list-outside my-6 space-y-1 ml-4">
              <li className="pl-3">
                Enter the contract address and name within the designated input
                fields.
              </li>
              <li className="pl-3">
                Click the{" "}
                <strong className="text-function">
                  Download Contract File
                </strong>{" "}
                button.
              </li>
              <li className="pl-3">
                The tool will fetch the ABI, address, and classHash from the
                network and generate a configuration file.
              </li>
              <li className="pl-3">
                Download the file and replace it to your local{" "}
                <code className="text-function">
                  configExternalContracts.ts
                </code>{" "}
                file.
              </li>
              <li className="pl-3">
                Use the{" "}
                <Link href={"/debug"} className="text-function">
                  <code>/debug</code>
                </Link>{" "}
                page to interact with and test the contract using the scaffold
                hooks.
              </li>
            </ol>
            <p className="mt-2">
              Ensure that the format of the ABI matches the expected format in
              your project before replacing the file.
            </p>
          </div>
          <div className="flex-1 px-12">
            {targetNetwork && (
              <div className="my-4 flex text-md flex-col">
                <div className="w-24 mb-2 font-medium break-words text-function">
                  Network
                </div>
                <span>{targetNetwork.name}</span>
              </div>
            )}
            <div className="flex flex-col my-6">
              <div className="w-24 mb-2 font-medium break-words text-function">
                Contract
              </div>
              <input
                value={symbol}
                onChange={handleInputChange}
                list="symbols"
                className="input bg-input input-ghost rounded-none focus-within:border-transparent focus:outline-none h-[2.2rem] min-h-[2.2rem] px-4 border w-full text-sm placeholder:text-[#9596BF] text-neutral"
                placeholder="Enter contract name"
              />
            </div>
            <div className="flex flex-col text-accent my-6">
              <div className="w-24 mb-2 font-medium break-words text-function">
                Address
              </div>
              <div className="flex flex-1 gap-4">
                <input
                  className="input bg-input input-ghost rounded-none focus-within:border-transparent focus:outline-none h-[2.2rem] min-h-[2.2rem] px-4 border w-full text-sm placeholder:text-[#9596BF] text-neutral"
                  type="text"
                  placeholder="Enter contract address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <button
                className="btn btn-sm mt-12 max-w-56 bg-gradient-nav !text-white shadow-md flex gap-2"
                onClick={handleDownload}
              >
                Download Contract File
                <span>
                  <ArrowDownTrayIcon
                    className="h-4 w-4 cursor-pointer"
                    aria-hidden="true"
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
